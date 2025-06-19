import os
import datetime
import inspect

class HandleLogs:

    def write_log(*mensaje):
        try:
            fun = inspect.currentframe().f_back.f_code.co_name
            now = datetime.datetime.now()
            path = os.path.abspath(os.path.dirname(__file__))
            name_file = path + "/LOGS"
            if not os.path.exists(name_file):
                os.makedirs(name_file)
            name_file = os.path.join(name_file, "LOG_" + now.strftime('%d_%m_%Y') + ".log")
            res = now.strftime("%H:%M:%S") + " - INF - " + fun + " - " + str(mensaje)
            f = open(name_file, "a")
            f.write(res + "\n")
            f.close()
            print(res)
        except Exception as e:
            print("Error al crear log" + str(e))


    def write_error(*err):
        try:
            fun = inspect.currentframe().f_back.f_code.co_name
            now = datetime.datetime.now()
            path = os.path.abspath(os.path.dirname(__file__))
            name_file = path + "/LOGS"
            if not os.path.exists(name_file):
                os.makedirs(name_file)
            name_file = os.path.join(name_file, "ERR_" + now.strftime('%d_%m_%Y') + ".log")
            res = now.strftime("%H:%M:%S") + " - ERR - " + fun + " - " + str(err)
            f = open(name_file, "a")
            f.write(res + "\n")
            f.close()
            print(res)
        except Exception as e:
            print("Error al crear log" + str(e))
