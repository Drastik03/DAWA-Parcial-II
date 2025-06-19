import smtplib
import base64
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from ..general.logs import HandleLogs
from ...api.Components.Security.TokenComponent import TokenComponent
from ..general.config import Config_SMPT


def get_email_template(reset_password_url):
    template_path = os.path.join('static/MessagePassword.html')
    with open(template_path, 'r', encoding='utf-8') as file:
        html_content = file.read()
    return html_content.replace("{reset_password_url}", reset_password_url)

def send_password_recovery_email(destinatario):
    try:
        result = True
        message = None
        data = None
        token_temp = TokenComponent.Token_Generate_ResetPassword(destinatario)
        token = base64.urlsafe_b64encode(token_temp.encode()).decode()
        reset_password_url = f"{Config_SMPT.url}{Config_SMPT.ruta}/{token}"
        content_mail = get_email_template(reset_password_url )
        msg = MIMEMultipart()
        msg['From'] = Config_SMPT.smpt_mail
        msg['To'] = destinatario
        msg['Subject'] = 'Recuperación de Contraseña'
        msg.attach(MIMEText(content_mail, 'html'))
        server = smtplib.SMTP(Config_SMPT.smpt_server, Config_SMPT.smpt_port)
        server.starttls()
        server.login(Config_SMPT.smpt_mail, Config_SMPT.smpt_password)


        server.send_message(msg)
        server.quit()

        message = "Mensaje de recuperación enviado a "+ destinatario
        data = destinatario
    except Exception as err:
        result = False
        HandleLogs.write_error(err)
        message = err.__str__()
    finally:
        return {
            'result': result,
            'message': message,
            'data': data
        }