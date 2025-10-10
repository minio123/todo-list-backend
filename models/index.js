import User from "./User.js";
import UserAccount from "./UserAccount.js";
import Todo from "./Todo.js";
import UserLog from "./UserLog.js";
import Token from "./Token.js";

// Define associations

//users --- user_accounts
User.hasOne(UserAccount, { foreignKey: "user_id" });
UserAccount.belongsTo(User, { foreignKey: "user_id" });

//users --- todos
User.hasMany(Todo, { foreignKey: "user_id" });
Todo.belongsTo(User, { foreignKey: "user_id" });

//users --- user_logs
User.hasMany(UserLog, { foreignKey: "user_id" });
UserLog.belongsTo(User, { foreignKey: "user_id" });

//users --- user_tokens
User.hasMany(Token, { foreignKey: "user_id" });
Token.belongsTo(User, { foreignKey: "user_id" });

export { User, UserAccount, UserLog, Token, Todo };
