import os
import paramiko
from scp import SCPClient

def send_and_run(ip_destino, archivo_origen, usuario, clave,
                 destino_archivo, ruta_script_remoto, interpreter="python3"):
    """
    Envía un archivo con SCP y luego ejecuta un script remoto,
    decodificando la salida con manejo de errores.
    """
    cliente_ssh = None
    try:
        cliente_ssh = paramiko.SSHClient()
        cliente_ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        cliente_ssh.connect(ip_destino, username=usuario, password=clave)
        print(f"[+] Conectado a {ip_destino}")

        # 1) Transferencia SCP
        with SCPClient(cliente_ssh.get_transport()) as scp:
            scp.put(archivo_origen, remote_path=destino_archivo, recursive=True)
        print(f"[+] Archivo enviado a {destino_archivo}")

        # 2) Ejecución del script
        comando = f'{interpreter} "{ruta_script_remoto}"'
        stdin, stdout, stderr = cliente_ssh.exec_command(comando)

        # Leer bytes crudos
        raw_out = stdout.read()
        raw_err = stderr.read()

        # Función helper para decodificar con fallback
        def safe_decode(raw_bytes):
            try:
                return raw_bytes.decode('utf-8')
            except UnicodeDecodeError:
                try:
                    # Prueba con otra codificación típica en Windows
                    return raw_bytes.decode('cp1252')
                except UnicodeDecodeError:
                    # Finalmente, reemplaza los bytes no decodificables
                    return raw_bytes.decode('utf-8', errors='replace')

        salida = safe_decode(raw_out).strip()
        errores = safe_decode(raw_err).strip()

        if salida:
            print("=== Salida del script ===")
            print(salida)
        if errores:
            print("=== Errores del script ===")
            print(errores)

    except Exception as e:
        print(f"[ERROR] {e}")
    finally:
        if cliente_ssh:
            cliente_ssh.close()
            print("[*] Conexión SSH cerrada")


if __name__ == "__main__":
    ip = "172.16.2.251"
    usuario = "HASSSIO"
    clave   = "99779977"

    origen             = "response/resultados_final.txt"
    destino_archivo    = "C:/Users/HASSSIO/Desktop/Asistente/ShowIA/resultados_final.txt"
    ruta_script_remoto = "C:/Users/HASSSIO/Desktop/Asistente/respuestaIA.py"

    send_and_run(
        ip_destino=ip,
        archivo_origen=origen,
        usuario=usuario,
        clave=clave,
        destino_archivo=destino_archivo,
        ruta_script_remoto=ruta_script_remoto,
        interpreter="python"   # ó "python3", según tu entorno remoto
    )
