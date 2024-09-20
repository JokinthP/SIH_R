from fastapi import File,UploadFile
from pydantic import BaseModel
from typing import Optional

#class ComplaintWithImageSchema(BaseModel):
 #   PNR: str
    #SNO: Optional[int] = None
  #  discription: str
    #category: str
    #sub_category: str
    #priority: str
    #status: str
    
class signinSchema(BaseModel):
    admin_name: str
    password : str    
    department : str
    
class loginSchema(BaseModel):
    admin_name: str
    password : str    
    
class StatusUpdateModel(BaseModel):
    status: str    
    
class feed(BaseModel):
    description : str    
    
