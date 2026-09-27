const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getMyProfile,
  createOrUpdateProfile,
} = require("../controllers/profileController");

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  getMyProfile
);

router.post(
  "/me",
  authMiddleware,
  createOrUpdateProfile
);

router.put(
  "/me",
  authMiddleware,
  createOrUpdateProfile
);

router.patch(
  "/me",
  authMiddleware,
  createOrUpdateProfile
);

module.exports = router;
