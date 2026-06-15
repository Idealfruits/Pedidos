# App de Pedidos - TODO

## Base de Datos y Backend
- [x] Crear esquema de tablas (pedidos, líneas_pedido, categorías)
- [x] Implementar procedimientos tRPC para crear pedidos
- [x] Implementar procedimientos tRPC para listar pedidos
- [x] Implementar procedimientos tRPC para filtrar pedidos
- [x] Implementar procedimiento para notificar propietario
- [x] Implementar procedimiento para subida de fotos a S3

## Portal de Inicio
- [x] Crear página de inicio con tarjetas de categorías
- [x] Implementar navegación a formulario por categoría
- [x] Diseñar tarjetas con estética editorial

## Formulario de Pedidos
- [x] Crear formulario con campos: Usuario, Producto, Proveedor, Código, Enlace, Unidades, Urgencia, Foto
- [x] Implementar funcionalidad "Añadir producto"
- [x] Implementar lista de líneas de producto
- [x] Implementar subida de fotos por producto (endpoint)
- [x] Validación de campos obligatorios
- [x] Integración con tRPC para envío de pedidos

## Historial de Pedidos
- [x] Crear página de historial/listado
- [x] Implementar filtros por categoría
- [x] Implementar filtros por urgencia
- [x] Implementar filtros por fecha
- [x] Mostrar detalles de pedidos

## Notificaciones
- [x] Implementar notificación automática al propietario
- [x] Configurar contenido de notificación

## Estilo Visual
- [x] Configurar paleta de colores (crema, alto contraste)
- [x] Implementar tipografía serif Didone para títulos
- [x] Aplicar espaciado generoso y composición asimétrica
- [x] Añadir líneas geométricas finas
- [x] Refinar detalles de diseño editorial

## Testing
- [x] Escribir tests para procedimientos tRPC
- [x] Escribir tests para validación de formularios

## Notas de Implementación
- Base de datos: Tablas creadas (order_categories, order_subcategories, orders, order_lines)
- Backend: Procedimientos tRPC para crear, listar y obtener pedidos
- Frontend: Portal de categorías, formulario multi-producto, historial de pedidos
- Estilo: Paleta crema (OKLCH 0.96 0.02 70), tipografía Playfair Display para títulos, Georgia para cuerpo
- Notificaciones: Integradas con helper notifyOwner() en procedimiento create
- Fotos: Estructura lista para subida (campos photoUrl y photoKey en BD)


## Cambios Solicitados (Nueva Iteración)
- [x] Cambiar fondo de crema a blanco
- [x] Optimizar diseño para móvil (responsive mejorado)
- [x] Quitar campo de usuario automático (entrada manual)
- [x] Integrar webhook de n8n para envío de correos a Gmail
- [x] Mejorar UX móvil (botones más grandes, espaciado táctil)


## Cambios de Acceso Público (Segunda Iteración)
- [x] Eliminar autenticación OAuth - acceso público completo
- [x] Cambiar procedimientos a publicProcedure
- [x] Remover verificaciones de login en todas las páginas
- [x] Quitar botones de login/logout
- [x] Permitir crear pedidos sin autenticación
- [x] Ver historial de todos los pedidos sin login
