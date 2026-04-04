import logging

# Set up logging for simulated email notifications
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MailService")

def send_payment_confirmation(user_email: str, amount: float, week_start: str, week_end: str):
    """
    Simulates sending a payment confirmation email.
    """
    message = f"""
    To: {user_email}
    Subject: Payment Received - Rakshak AI Protection
    
    Dear Worker,
    
    We have received your payment of INR {amount}.
    Your protection is now ACTIVE for the period: {week_start} to {week_end}.
    
    You are now covered for accidents, weather disruptions, and more.
    Stay safe!
    
    Best,
    The Rakshak AI Team
    """
    logger.info("SIMULATED EMAIL SENT:\n" + message)
    return True
