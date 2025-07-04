import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import jsonify


#def send_email(destinatario, asunto, mensaje):
 #   remitente = ''
  #  contraseña = ''

   # msg = MIMEMultipart()
   # msg['From'] = remitente
   # msg['To'] = destinatario
   # msg['Subject'] = asunto

    #msg.attach(MIMEText(mensaje, 'plain'))

    #servidor_smtp = 'smtp.gmail.com'
    #puerto_smtp = 587
    #server = smtplib.SMTP(servidor_smtp, puerto_smtp)

    #server.starttls()
    #server.login(remitente, contraseña)

    #server.send_message(msg)

    #server.quit()



def get_email(destinatario, asunto, mensaje):


    remitente = 'tesiscorreos@gmail.com'
    contraseña = 'dmhnnuovubrunnwp'

    msg = MIMEMultipart()
    msg['From'] = remitente
    msg['To'] = destinatario
    msg['Subject'] = asunto

    msg.attach(MIMEText(mensaje, 'plain', 'utf-8'))

    servidor_smtp = 'smtp.gmail.com'
    puerto_smtp = 587
    server = smtplib.SMTP(servidor_smtp, puerto_smtp)

    server.starttls()
    server.login(remitente, contraseña)

    server.send_message(msg)

    server.quit()
   
    
    try:
    
        return jsonify({'message': 'EL Sistema de Evaluacion y Coevalacion Docente, cumple con informar que usded ha sido matriculado de manera automarica Nota : Favor no responder este correo'}) , 200
     
    except Exception as ex:
        print(ex)
        return jsonify({'error': str(ex)}), 500
