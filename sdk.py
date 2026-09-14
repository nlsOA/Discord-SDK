import psutil
import time
import json
import sys
from pypresence import Presence, exceptions

CONFIG_PATH = "config.json"


def cargar_config():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
    except FileNotFoundError:
        print(f"Error: no se encontró '{CONFIG_PATH}' en esta carpeta.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: '{CONFIG_PATH}' tiene un JSON inválido -> {e}")
        sys.exit(1)

    if not config.get("estados"):
        print("Error: el config no tiene ningún estado definido en 'estados'.")
        sys.exit(1)

    return config


def discord_esta_abierto():
    return any(p.name().lower() == "discord.exe" for p in psutil.process_iter(['name']))


def main():
    config = cargar_config()
    client_id = config["client_id"]
    estados = config["estados"]
    intervalo_cambio = config.get("intervalo_cambio", 60)

    print(f"Configuración cargada: {len(estados)} estado(s), rotando cada {intervalo_cambio}s")

    RPC = None
    indice_actual = 0
    ultimo_cambio = 0
    tiempo_inicio = None

    while True:
        if discord_esta_abierto():
            if RPC is None:
                try:
                    RPC = Presence(client_id)
                    RPC.connect()
                    print("Conectado a Discord")
                    tiempo_inicio = time.time()
                    ultimo_cambio = 0
                except Exception as e:
                    print("Error al conectar:", e)
                    RPC = None

            if RPC is not None and (time.time() - ultimo_cambio >= intervalo_cambio):
                try:
                    RPC.update(**estados[indice_actual], start=tiempo_inicio)
                    print(f"Actualizado a: {estados[indice_actual]['state']}")
                    indice_actual = (indice_actual + 1) % len(estados)
                    ultimo_cambio = time.time()
                except Exception as e:
                    print("Error al actualizar:", e)
                    RPC = None
        else:
            RPC = None
            tiempo_inicio = None

        time.sleep(5)


if __name__ == "__main__":
    main()