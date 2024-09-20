from pymongo import MongoClient

# MongoDB connection settings
MONGO_DETAILS = "mongodb://localhost:27017"  # Adjust as needed
client = MongoClient(MONGO_DETAILS)
database = client.SIH
collection = database.complaint
collection1 = database.admin
collection2 = database.feedback