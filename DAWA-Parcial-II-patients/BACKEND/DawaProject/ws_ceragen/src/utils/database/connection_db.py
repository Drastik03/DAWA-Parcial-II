#Permitir conectarme a una base de datos PostgreSQl
import psycopg2
import psycopg2.extras
from psycopg2.extras import RealDictCursor
from ..general.config import Parametros
from ..general.logs import HandleLogs
from ..general.response import internal_response

def conn_db():
    return psycopg2.connect(host=Parametros.db_host,
                            port=int(Parametros.db_port),
                            user=Parametros.db_user,
                            password=Parametros.db_pass,
                            database=Parametros.db_name,
                            cursor_factory=RealDictCursor)
print("Base actual:", Parametros.db_host, Parametros.db_name)

class DataBaseHandle:
    #Nuestros Metodos para ejecutar sentencias.
    @staticmethod
    def getRecords(query,  tamanio, record=()):
        try:
            res = None
            result = False
            message = None
            conn = conn_db()
            cursor = conn.cursor()
            if len(record) == 0:
                cursor.execute(query)
            else:
                cursor.execute(query, record)

            # tamanio es 0 todos, 1 solo uno, > 1 n registros
            if tamanio == 0:
                res = cursor.fetchall()

            elif tamanio == 1:
                res = cursor.fetchone()
            else:
                res = cursor.fetchmany(tamanio)

            result = True

        except Exception as ex:
            HandleLogs.write_error(ex)
            message = ex.__str__()
        finally:
            cursor.close()
            conn.close()
            return internal_response(result, message, res)

    @staticmethod
    def getRecord(query, tamanio, record=()):
        try:
            conn = conn_db()
            cursor = conn.cursor()
            if len(record) == 0:
                cursor.execute(query)
            else:
                cursor.execute(query, record)
            # tamanio es 0 todos, 1 solo uno, > 1 n registros
            if tamanio == 0:
                res = cursor.fetchall()
            elif tamanio == 1:
                res = cursor.fetchone()
            else:
                res = cursor.fetchmany(tamanio)

            return res
        except Exception as ex:
            HandleLogs.write_error(ex)
        finally:
            cursor.close()
            conn.close()


    @staticmethod
    def execute(query, record=()):
        try:
            conn = conn_db()
            cursor = conn.cursor()
            if len(record) == 0:
                cursor.execute(query)
            else:
                cursor.execute(query, record)
            conn.commit()
            HandleLogs.write_log(f"Executed query: {query} with record: {record}")
            return True
        except Exception as ex:
            HandleLogs.write_error(f"execute - {ex}")
            return False
        finally:
            cursor.close()
            conn.close()
    
    
    @staticmethod
    def ExecuteNonQuery(query, record):
        try:
            res = None
            result = False
            message = None
            conn = conn_db()
            cursor = conn.cursor()
            if len(record) == 0:
                cursor.execute(query)
            else:
                cursor.execute(query, record)

            if query.find('INSERT') > -1:
                cursor.execute('SELECT LASTVAL()')
                ult_id = cursor.fetchone()['lastval']
                conn.commit()
                res = ult_id
            else:
                conn.commit()
                res = cursor.rowcount
            result = True

        except Exception as ex:
            HandleLogs.write_log("Error de SQL " + ex.__str__())
            HandleLogs.write_error(ex)
            error_message = ex.__str__()
            message = error_message.split('\nCONTEXT:')[0]

        finally:
            cursor.close()
            conn.close()
            return internal_response(result, message, res)

    #Aplicar cuando el script SQL usa  RETURNING
    @staticmethod
    def ExecuteInsert(query, record=()):
        try:
            res = None
            result = False
            message = None
            conn = conn_db()
            cursor = conn.cursor()
            if len(record) == 0:
                cursor.execute(query)
            else:
                cursor.execute(query, record)

            conn.commit()
            res = cursor.fetchall()
            result = True

        except Exception as ex:
            HandleLogs.write_log("Error de SQL " + ex.__str__())
            HandleLogs.write_error(ex)
            error_message = ex.__str__()
            message = error_message.split('\nCONTEXT:')[0]
        finally:
            cursor.close()
            conn.close()
            return internal_response(result, message, res)

