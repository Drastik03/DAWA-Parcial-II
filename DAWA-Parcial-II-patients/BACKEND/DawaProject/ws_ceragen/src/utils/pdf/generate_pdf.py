from flask import Flask, send_file, make_response
from fpdf import FPDF
import io
import matplotlib
matplotlib.use('Agg')
from matplotlib import pyplot as plt
import numpy as np
import os

app = Flask(__name__)


class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        
        # Ruta de la imagen del logo
        #logo_path = '/mnt/data/encabezado.png'
        
        # Agregar logo
        #self.image(logo_path, 10, 8, 33)
        
        # Sangría derecha para el texto después del logo
        self.set_xy(50, 10)
        
        cell_width = 130  # Ajusta este valor según sea necesario

        self.cell(cell_width, 7, 'FACULTAD: POR DEFINIR', 0, 1, 'L')
        self.set_x(50)
        self.cell(cell_width, 7, 'CARRERA: POR DEFINIR', 0, 1, 'L')
        self.set_x(50)
        self.cell(cell_width, 7, 'REGISTRO DEL CURSO Y SUS ACTIVIDADES', 0, 1, 'L')
        self.set_x(50)
        self.cell(cell_width, 7, 'APELLIDOS Y NOMBRES: ARROYO OROZCO JORGE JOSÉ', 0, 1, 'L')
        self.set_x(50)
        self.cell(cell_width, 7, 'IDENTIFICACIÓN: 0911953321', 0, 0, 'L')
        self.set_x(120)
        self.cell(cell_width, 7, 'IMPRESO: 2022-03-27 15:35:01', 0, 1, 'L')
        
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 7, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 7, title, 0, 1, 'L')
        self.ln(10)

    def chapter_body(self, body):
        self.set_font('Arial', '', 12)
        self.multi_cell(0, 7, body)
        self.ln()
        
    # generar los gráficos y guardarlos en archivos de imagen 
    def create_pie_chart(self, labels, sizes, filename):
        fig, ax = plt.subplots()
        ax.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90, colors=['#ff9999','#66b3ff'])
        ax.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.
        plt.savefig(filename)
        plt.close()
        
   
       


def generate_pdf():
    pdf = PDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 12)
    
    # Línea superior para "DETALLE DEL CURSO"
    pdf.cell(0, 7, 'DETALLE DEL CURSO', 0, 1, 'L')
    pdf.line(10, 49, 200, 49)  # Línea debajo de "DETALLE DEL CURSO"
    pdf.line(10, 57, 200, 57)  # Línea inferior para "DETALLE DEL CURSO"
    pdf.ln(1)
    # Información del curso
    pdf.set_font('Arial', '', 12)
    cell_width = 70  # Ajusta este valor según sea necesario
    
    pdf.cell(0, 7, 'NOMBRE: PEDAGOGÍA EN EDUCACIÓN SUPERIOR', 0, 1, 'L')
    pdf.cell(cell_width, 7, 'ESTADO: EN PROCESO', 0, 0, 'L')
    pdf.set_x(70)
    pdf.cell(cell_width, 7, 'INICIO: 2022-02-07 19:00:00', 0, 0, 'L')
    pdf.set_x(145)
    pdf.cell(cell_width, 7, 'FIN: 2022-09-14 19:00:00', 0, 1, 'L')
    pdf.ln(10)
    
    # Actividades y Calificaciones del grafico psatel
    pdf.cell(0, 7, 'Actividades VS Calificaciones', 0, 0, 'L')
    pdf.cell(0, 7, 'Actividades calificados VS Actividades sin calificar', 0, 1, 'R')
    pdf.ln(5)
    #crear dos graficos de pastel 
    labels = ['Sin calificar', 'pruebato']
    sizes = [88.89, 11.11]
    pdf.create_pie_chart(labels, sizes, 'pie1.png')
    pdf.create_pie_chart(labels, sizes, 'pie2.png')
    #Mostrar graficos de pastel 
    pdf.image('pie1.png', x=10, y=pdf.get_y(), w=90)
    pdf.image('pie2.png', x=110, y=pdf.get_y(), w=90)
    pdf.ln(60)
        
    #crear tabla de actividades
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0,7, 'ACTIVIDADES', 0, 1, 'L')
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(140, 7, 'NOMBRE DE LA ACTIVIDAD', 1, 0, 'C')
    pdf.cell(40, 7, 'CALIFICACIÓN', 1, 1, 'C')
    pdf.set_font('Arial', '', 12)
    
    actividades = [
        ("LAS TEORÍAS DE APRENDIZAJE (envío)", "0.0"),
        ("LAS TEORÍAS DE APRENDIZAJE (evaluación)", "0.0"),
        ("El constructivismo en el aula de clase (envío)", "0.0"),
        ("El constructivismo en el aula de clase (evaluación)", "0.0"),
        ("Taller Grupal", "0.0"),
        ("Taller Grupal", "0.0"),
        ("Evaluación de cierre", "0.0"),
        ("prueba10", "10.0"),
    ]
    
    for actividad, calificacion in actividades:
        pdf.cell(140, 10, actividad, 1)
        pdf.cell(40, 10, calificacion, 1, 1, 'C')


    pdf_output = pdf.output(dest='S').encode('latin1')
    pdf_buffer = io.BytesIO(pdf_output)
    pdf_buffer.seek(0)
    
        # Eliminar archivos temporales
    os.remove('pie1.png')
    os.remove('pie2.png')
    
    
    
    return pdf_buffer
