
const express = require("express");

const {
  getContact,
  updateContact,
} = require("../controllers/contactController");

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET CONTACT
|--------------------------------------------------------------------------
| GET /api/contact
| Public
*/

router.get(
  "/",
  getContact
);


/*
|--------------------------------------------------------------------------
| UPDATE CONTACT
|--------------------------------------------------------------------------
| PUT /api/contact
| Protected
*/

router.put(
  "/",
  authMiddleware,
  updateContact
);

module.exports = router;
