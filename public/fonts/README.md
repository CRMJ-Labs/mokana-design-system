# Fuentes autoalojadas

El Design System usa exclusivamente Inter Variable mediante el paquete `@fontsource-variable/inter`.

El sitio importa la fuente durante el build. El paquete React la ofrece por separado en `@mokanadev/design-system/fonts.css`, con archivos WOFF2 cacheables y selección por subconjunto Unicode. Sus estilos de componentes no cargan fuentes. Inter admite pesos de 100 a 900 y no realiza llamadas a Google Fonts desde el navegador. La versión e integridad se registran en `package-lock.json`; la licencia OFL-1.1 se distribuye en `dist/fonts/OFL.txt`.

Procedencia: https://fontsource.org/fonts/inter
