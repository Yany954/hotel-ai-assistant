// Admin endpoints for managing room data. The React AdminPage calls these — it never writes to
// Firestore directly. Every write goes through requireRole("admin") first.
//
// TODO:
//   POST   /admin/rooms       create a room
//   PUT    /admin/rooms/:id   update a room
//   DELETE /admin/rooms/:id   remove a room
//   GET    /admin/rooms       list all rooms (for the admin table view)
