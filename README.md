# Discord-SDK
 
Repositorio: https://github.com/nlsOA/Discord-SDK
 
## Descripción general
 
Herramienta para gestionar el Rich Presence de Discord (el estado que se muestra en el perfil, tipo "jugando a..."). Está dividida en dos componentes independientes que comparten un mismo archivo de configuración:
 
- `sdk.py`: proceso en Python que se conecta a Discord y actualiza el estado.
- `rpc-editor`: panel web local, construido en Node y Express, para editar esa configuración sin escribir el JSON a mano.
## Tecnologías utilizadas
 
**Python**
- `pypresence`, para el protocolo IPC con Discord (Rich Presence).
- `psutil`, para detectar si el proceso de Discord está corriendo.
**Node.js**
- Express, para el servidor del panel de configuración y su API.
**Frontend**
- HTML, CSS y JavaScript sin frameworks, usando `fetch` y `<template>` para renderizar las tarjetas de cada estado.
**Configuración**
- JSON como formato compartido entre el script de Python y el panel web.
## Estructura del repositorio
 
```
config.json
sdk.py
 
rpc-editor/
  server.js
  package.json
  public/
    index.html
    script.js
    style.css
```
 
## Funcionamiento de sdk.py
 
El script carga `config.json` al iniciar: client ID de la app de Discord, la lista de estados a rotar y el intervalo de rotación. Si el archivo falta o el JSON es inválido, termina la ejecución con un mensaje de error.
 
A partir de ahí corre en un loop continuo, revisando cada 5 segundos si Discord está abierto. Cuando lo detecta, establece la conexión mediante `pypresence` y, respetando el intervalo configurado, va actualizando el estado mostrado con los datos definidos (state, details, imágenes y textos asociados). Si Discord se cierra o la conexión falla, el script descarta la conexión activa y vuelve a intentarlo en la siguiente vuelta del loop, sin necesidad de reiniciarlo manualmente.
 
## Funcionamiento del rpc-editor
 
Es un panel para editar `config.json` desde el navegador en lugar de modificarlo a mano.
 
El servidor expone dos rutas:
- `GET /api/config`, que devuelve el contenido actual del archivo.
- `POST /api/config`, que valida el body recibido (client ID presente, estados como array) y sobrescribe el archivo.
La ruta del archivo de configuración puede definirse mediante la variable de entorno `CONFIG_PATH`, en caso de que no esté en la ubicación por defecto.
 
En el frontend, cada estado se muestra como una tarjeta con campos editables (state, details, imágenes grandes y chicas con sus textos). Permite agregar, editar y borrar estados, y muestra si hay cambios sin guardar antes de confirmar el guardado.
 
## Uso
 
1. Crear la aplicación en el Discord Developer Portal y obtener el client ID.
2. Levantar el panel (`node server.js`) para cargar el client ID, el intervalo de rotación y los estados.
3. Ejecutar `sdk.py` con Discord abierto. El script se conecta automáticamente y empieza a rotar los estados según la configuración guardada.
## Nota de diseño
 
Las dos partes no se comunican entre sí directamente: ambas leen y escriben el mismo `config.json`. Esto mantiene el script de Python simple y permite editar la configuración sin detenerlo ni tocar el código.
