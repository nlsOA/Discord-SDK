import psutil
import time
from pypresence import Presence, exceptions

client_id = "1530342268219953293"

def discord_esta_abierto():
    return any(p.name().lower() == "discord.exe" for p in psutil.process_iter(['name']))

estados = [
    #{
    #    "state": "Chill mode",
    #    "details": "MUSIC TIME 🎵",
    #    "large_image": "chill",
    #    "large_text": "science",
    #    "small_image": "nico",
    #    "small_text": "also chill"
    #},
    #{
    #    "state": "Estudiando",
    #    "details": "COOKING TIME 🧠",
    #    "large_image": "ingeniero",
    #   "large_text": "building stuff",
    #    "small_image": "nico",
    #    "small_text": "focus mode"
    #},
    #{
    #    "state": "Quiza en Dc",
    #    "details": "BOLUDEANDO ☕",
    #    "large_image": "chill_c",
    #    "large_text": "descansando",
    #    "small_image": "nico",
    #    "small_text": "back soon"
    #},
    {
        "state": "Let's Develop a Game",
        "details": "THE JAM TRAINING",
        "large_image": "logo",
        "large_text": "UTN JAM",
        "small_image": "noa",
        "small_text": "NULL"
    },
]

RPC = None
indice_actual = 0
ultimo_cambio = 0
INTERVALO_CAMBIO = 100
tiempo_inicio = None  # todavía no se fija, se fija recién al conectar

while True:
    if discord_esta_abierto():
        if RPC is None:
            try:
                RPC = Presence(client_id)
                RPC.connect()
                print("Conectado a Discord")
                tiempo_inicio = time.time()  # se fija UNA sola vez, acá
                ultimo_cambio = 0  # fuerza update inmediato
            except Exception as e:
                print("Error al conectar:", e)
                RPC = None

        if RPC is not None and (time.time() - ultimo_cambio >= INTERVALO_CAMBIO):
            try:
                RPC.update(**estados[indice_actual], start=tiempo_inicio)  # siempre el mismo valor
                print(f"Actualizado a: {estados[indice_actual]['state']}")
                indice_actual = (indice_actual + 1) % len(estados)
                ultimo_cambio = time.time()
            except Exception as e:
                print("Error al actualizar:", e)
                RPC = None
    else:
        RPC = None
        tiempo_inicio = None  # si Discord se cierra, se resetea para la próxima vez que abras

    time.sleep(5)