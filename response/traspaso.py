import paramiko
from scp import SCPClient

def sendFile(ip_destino, archivo_origen, usuario, clave, directorio_destino):
    try:
        # Crear una instancia SSH
        cliente_ssh = paramiko.SSHClient()
       
        # Asegurarse de que la máquina remota es confiable (esto es para evitar problemas con el host desconocido)
        cliente_ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
       
        # Conectar al servidor SSH remoto
        cliente_ssh.connect(ip_destino, username=usuario, password=clave)
       
        # Usar SCP para transferir el archivo
        with SCPClient(cliente_ssh.get_transport()) as scp:
            # Especificar el directorio de destino
            scp.put(archivo_origen, remote_path=directorio_destino, recursive=True)  # `recursive=True` para directorios

        print("Archivo enviado exitosamente")
       
    except Exception as e:
        print(f"Error al enviar el archivo: {e}")
   
    finally:
        cliente_ssh.close()


sendFile("172.16.2.251",f"response/resultados.txt", "HASSSIO", "99779977", f"C:/Users/HASSSIO/Desktop/Asistente/ShowIA/")
