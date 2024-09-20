from schemas import loginSchema,signinSchema,StatusUpdateModel,feed
from bson import ObjectId
from fastapi import FastAPI, HTTPException, File, UploadFile, Depends , Form , Header,Query,Request,Path
from db import collection,collection1,collection2
from typing import List,Optional
import base64
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
from fastapi import BackgroundTasks
import random



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PUT" , "DELETE","PATCH"],  # Add OPTIONS method
    allow_headers=["Authorization","Content-Type"],
)

priority = {
    'Coaches' : "low",
    'Ticket booking' : "medium",
    'Electrical Appliance' : "low",
    'Overcrowd' : "high",
    'Food' : "medium"
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Load the saved TensorFlow model for CIFAR-10 classification
model = tf.keras.models.load_model('Complaint_classification_5.h5')

# Define class names for CIFAR-10
class_names = [ 'Coaches', 'Electrical Appliance','Food','Overcrowd' ,'Ticket booking']

def preprocess_image(image: Image.Image):
    image = image.resize((150, 150))  # Resize to the expected input size
    image = np.array(image) / 255.0  # Normalize to range [0,1]
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

SECRET_KEY = "your_secret_key"  # Replace with a more secure key
ALGORITHM = "HS256"  

@app.post("/add_complaint_with_image/", response_model=dict)
async def add_complaint_with_image(
    image: UploadFile = File(...),
    pnr: str = Form(...),
    description: str = Form(...),
    mobile_number: str = Form(...)  # Accept mobile number as form data
):
    try:
        # Read the image and encode it to base64
        image_content = await image.read()
        encoded_image = base64.b64encode(image_content).decode("utf-8")
        
        # Preprocess image for prediction
        image_pil = Image.open(io.BytesIO(image_content))
        processed_image = preprocess_image(image_pil)
        
        # Make prediction
        try:
            with tf.device('/GPU:0'):
               predictions = model.predict(processed_image)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
        predicted_class = np.argmax(predictions[0])
        prediction_label = class_names[predicted_class]
        if np.max(predictions[0]) < 0.1:
           return {"message": "not proper image"}

        # Create the complaint data dictionary
        complaint_data = {
            "pnr": pnr,
            "description": description,
            "mobile_number": mobile_number,  # Add mobile number to the complaint data
            "image": encoded_image,
            "category": prediction_label,
            "sub_category": prediction_label,
            "priority": priority[prediction_label],
            "status": "pending"
        }
        
        # Insert the complaint with the image into MongoDB
        result = collection.insert_one(complaint_data)
        return {"message": "Complaint with image and mobile number added", "id": str(result.inserted_id)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inserting data: {e}")
        
@app.get("/get_complaint/{complaint_id}", response_model=dict)
async def get_complaint(complaint_id: str):
    try:
        # Find the complaint by its ID
        complaint = collection.find_one({"_id": ObjectId(complaint_id)})
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")

        # Convert ObjectId to string before returning
        complaint["_id"] = str(complaint["_id"])

        # If the complaint contains an image, return it as base64-encoded string
        if "image" in complaint:
            complaint["image"] = complaint["image"]  # Base64-encoded string

        return complaint
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving data: {e}")

def decode_jwt_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

@app.get("/get_complaints/", response_model=List[dict])
async def get_complaints(authorization: Optional[str] = Header(None)):
    try:
        if authorization is None or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Authorization header missing or invalid.")

        token = authorization.split(" ")[1]  # Extract token from "Bearer <token>"
        decoded_token = decode_jwt_token(token)  # Decode and validate token

        # Extract admin_name and optionally department from the token payload
        admin_name = decoded_token.get("sub")
        
        # Find the admin in the collection1 to retrieve department info
        admin_data = collection1.find_one({"admin_name": admin_name})
        if not admin_data:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        admin_department = admin_data.get("department")
        if not admin_department:
            raise HTTPException(status_code=404, detail="Admin's department not found")

        # Retrieve complaints filtered by the admin's department
        complaints = list(collection.find({"category": admin_department}))
        
        # Convert documents to a format suitable for response
        for complaint in complaints:
            complaint["_id"] = str(complaint["_id"])  # Convert ObjectId to string
            
            # If the complaint contains an image, keep it as base64-encoded string
            if "image" in complaint:
                complaint["image"] = complaint["image"]  # Base64-encoded string
        
        return complaints
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving data: {e}")
        
@app.get("/admin_signin/")
async def admin_signin(admin: str = Depends(signinSchema)):
    # Check if the username already exists in the collection
    existing_admin = collection1.find_one({"admin_name": admin.admin_name})
    
    if existing_admin:
        return {"error": "Username already exists. Please choose a different one."}
    
    # Hash the password and insert new admin data
    hash_password = pwd_context.hash(admin.password)
    admin_data = admin.dict()
    admin_data["password"] = hash_password
    collection1.insert_one(admin_data)
    
    return {"message": "Admin account created successfully."}
# You can choose other algorithms as well

def create_jwt_token(admin_name: str, admin_department: str):
    expiration = datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
    token_data = {
        "sub": admin_name,
        "department": admin_department,  # Add department to the token payload
        "exp": expiration
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return token


@app.post("/admin_login/")
async def admin_login(admin: loginSchema):
    # Find the admin by username
    existing_admin = collection1.find_one({"admin_name": admin.admin_name})
    
    if not existing_admin:
        raise HTTPException(status_code=404, detail="Username does not exist.")
    
    # Verify the password
    if not pwd_context.verify(admin.password, existing_admin["password"]):
        raise HTTPException(status_code=401, detail="Incorrect password.")
    
    # Retrieve the department of the admin
    admin_department = existing_admin.get("department")
    
    # Create a JWT token with admin_name and department
    token = create_jwt_token(admin.admin_name, admin_department)
    
    return {"message": "Login successful.", "token": token}

@app.get("/complaints")
async def get_complaint_statistics():
    try:
        # Count total complaints
        total_complaints = collection.count_documents({})
        
        # Count solved complaints
        solved_complaints = collection.count_documents({"status": "Completed"})
        
        # Count unsolved complaints
        unsolved_complaints = collection.count_documents({"status": "pending"})
        
        return {
            "total": total_complaints,
            "solved": solved_complaints,
            "unsolved": unsolved_complaints
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# In-memory OTP storage (for demonstration purposes only)
otp_store = {}

from twilio.rest import Client
import random

# Your Twilio account SID and auth token
ACCOUNT_SID = 'AC1dbc2bd06f25c88284afcfffc5fa260c'
AUTH_TOKEN = '10ee567f81d73854bc5061138a8dbb66'
TWILIO_PHONE_NUMBER = '+12563339584'

client = Client(ACCOUNT_SID, AUTH_TOKEN)

def send_otp_twilio(phone_number: str):
    otp = random.randint(1000, 9999)  # Generate a 4-digit OTP
    message_body = f"Your OTP is {otp}. It is valid for the next 10 minutes."
    
    try:
        message = client.messages.create(
            body=message_body,
            from_=TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        print(f"Message sent with SID: {message.sid}")
        return otp  # Return OTP so it can be stored for verification later
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


@app.post("/send_otp/{phone_number}")
async def send_otp(phone_number: str):
    if len(phone_number) != 10:
        raise HTTPException(status_code=400, detail="Invalid phone number format. It should be in E.164 format.")
    phone_number = "+91" + phone_number.lstrip("0")
    otp = send_otp_twilio(phone_number)
    if otp is None:
        raise HTTPException(status_code=500, detail="Failed to send OTP.")
    
    otp_store[phone_number] = otp
    
    return {"message": "OTP sent"}

@app.post("/verify_otp/{phone_number}/{otp}")
async def verify_otp(phone_number: str, otp: str):
    phone_number = "+91" + phone_number.lstrip("0")
    stored_otp = otp_store.get(phone_number)
    if not stored_otp:
        raise HTTPException(status_code=400, detail="OTP not found for this phone number.")
    
    if str(stored_otp) != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    # Remove OTP after successful verification
    otp_store.pop(phone_number)

    return {"message": "OTP verified"}

@app.patch("/update_complaint_status/{complaint_id}")
async def update_complaint_status(
    complaint_id: str,
    status_update: StatusUpdateModel
):
    try:
        # Convert string ID to ObjectId
        object_id = ObjectId(complaint_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid complaint ID format")
    
    # Fetch the complaint details to get the mobile number
    complaint = collection.find_one({"_id": object_id})
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Update the status in the database
    result = collection.update_one(
        {"_id": object_id},
        {"$set": {"status": status_update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update complaint status")
    
    # If the status is updated to "Completed", send an SMS to the complainant
    if status_update.status == "Completed":
        mobile_number = complaint.get("mobile_number")
        if mobile_number:
            mobile_number = "+91" + mobile_number.lstrip("0")
            message_body = f"Dear customer, your complaint with PNR {complaint.get('pnr')} has been marked as 'Completed'. Thank you for your patience."
            try:
                message = client.messages.create(
                    body=message_body,
                    from_=TWILIO_PHONE_NUMBER,
                    to=mobile_number
                )
                print(f"Message sent with SID: {message.sid}")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to send SMS: {e}")
    
    return {"message": "Complaint status updated successfully"}

@app.post("/submit_feedback/")
async def submit_feedback(feedback: feed):
    result = collection2.insert_one(feedback.dict())
    return {"message": "Feedback added successfully"}