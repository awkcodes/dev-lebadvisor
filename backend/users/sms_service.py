# users/sms_service.py
import requests

J_TELECOM_USER = "Ghaith"
J_TELECOM_PASSWORD = "Ghaith!321"
J_TELECOM_SENDER_ID = "LEBADV"

def send_sms(phone_number, message):
    """
    Sends an SMS using j-telecom to the given phone_number with the provided message.
    phone_number must be in the format '961xxxxxxxx'.
    """
    base_url = "http://sms.j-telecom.co.uk/vendorsms/pushsms.aspx"
    params = {
        "user": J_TELECOM_USER,
        "password": J_TELECOM_PASSWORD,
        "msisdn": phone_number,
        "sid": J_TELECOM_SENDER_ID,
        "msg": message,
        "fl": 0
    }
    response = requests.get(base_url, params=params)
    # Optional: Check or log response status
    return response
