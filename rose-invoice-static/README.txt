Rose Legacy — Static Invoice App
=================================

Qué es
------
Una web estática (HTML + CSS + JS) que puedes subir a Hostinger (plan estático) sin backend.
Permite crear invoices, descargarlos en PDF en el navegador y guardar/cargar como JSON.

Cómo usar
---------
1) Sube la carpeta completa al hosting (o abre index.html localmente).
2) Llena los datos del invoice y los items.
3) Clic en "Download PDF" para generar el PDF en el navegador.
4) "Save as JSON" guarda el invoice para editarlo después.
5) "Load JSON" te permite cargar un JSON previamente guardado.

Notas
-----
- Los cálculos son locales (no hay base de datos).
- El PDF se genera con jsPDF + AutoTable vía CDN.
- Puedes cambiar colores y textos en style.css y app.js.
