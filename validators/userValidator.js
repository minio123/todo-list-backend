import { body, validationResult } from "express-validator";

export const validatePassword = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Must contain a lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Must contain a number")
    .matches(/[\W]/)
    .withMessage("Must contain a special character"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required"),

  (req, res, next) => {
    const errors = validationResult(req);

    // Check for validation errors first
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if password and confirmPassword match
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({
        errors: [
          {
            msg: "Passwords do not match",
            path: "confirmPassword",
            location: "body",
          },
        ],
      });
    }

    next();
  },
];

const validateUserInputs = [
  body("firstname").notEmpty().withMessage("First name is required"),
  body("lastname").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const createUserValidator = [...validateUserInputs, ...validatePassword];
export const updateUserValidator = validateUserInputs;
export const updatePasswordValidator = validatePassword;

//
