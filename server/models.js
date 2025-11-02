import { DataTypes } from 'sequelize';

// 这个函数用于初始化所有模型
export function initModels(sequelize) {
  // Define User Model
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    online_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    last_active: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Define Note Model
  const Note = sequelize.define('Note', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  // Define Game Model
  const Game = sequelize.define('Game', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Define Strategy Model
  const Strategy = sequelize.define('Strategy', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'published'
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    image_urls: {
      type: DataTypes.STRING,
      allowNull: true
    },
    video_urls: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  // Define Tag Model
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#409EFF'
    }
  });

  // Define StrategyTag Model
  const StrategyTag = sequelize.define('StrategyTag', {
    strategy_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  // Define UserFavorite Model
  const UserFavorite = sequelize.define('UserFavorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    strategy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Strategies', key: 'id' }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { tableName: 'user_favorites' });

  // Define UserHistory Model
  const UserHistory = sequelize.define('UserHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    strategy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Strategies', key: 'id' }
    },
    viewed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { tableName: 'user_history' });

  // Define CommunityChannel Model
  const CommunityChannel = sequelize.define('CommunityChannel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { tableName: 'community_channels' });

  // Define CommunityMessage Model
  const CommunityMessage = sequelize.define('CommunityMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    channel_id: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      references: { model: 'community_channels', key: 'id' }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { tableName: 'community_messages' });

  // Define Friendship Model
  const Friendship = sequelize.define('Friendship', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    friend_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending' // pending, accepted, blocked
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { tableName: 'friendships' });

  // Define ChatMessage Model
  const ChatMessage = sequelize.define('ChatMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, { tableName: 'chat_messages' });

  // Define UserProfile Model
  const UserProfile = sequelize.define('UserProfile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'Users', key: 'id' }
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { tableName: 'user_profiles' });

  // Define associations
  Game.hasMany(Strategy, { foreignKey: 'game_id' });
  Strategy.belongsTo(Game, { foreignKey: 'game_id' });

  Strategy.belongsToMany(Tag, { through: StrategyTag, foreignKey: 'strategy_id' });
  Tag.belongsToMany(Strategy, { through: StrategyTag, foreignKey: 'tag_id' });

  // User associations
  User.hasMany(Note, { foreignKey: 'userId' });
  Note.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(Strategy, { foreignKey: 'user_id' });
  Strategy.belongsTo(User, { foreignKey: 'user_id' });

  // UserFavorite associations
  User.hasMany(UserFavorite, { foreignKey: 'user_id' });
  UserFavorite.belongsTo(User, { foreignKey: 'user_id' });
  UserFavorite.belongsTo(Strategy, { foreignKey: 'strategy_id' });

  // UserHistory associations
  User.hasMany(UserHistory, { foreignKey: 'user_id' });
  UserHistory.belongsTo(User, { foreignKey: 'user_id' });
  UserHistory.belongsTo(Strategy, { foreignKey: 'strategy_id' });

  // Community associations
  CommunityChannel.hasMany(CommunityMessage, { foreignKey: 'channel_id' });
  CommunityMessage.belongsTo(CommunityChannel, { foreignKey: 'channel_id' });
  CommunityMessage.belongsTo(User, { foreignKey: 'user_id' });

  // Friendship associations
  User.hasMany(Friendship, { foreignKey: 'user_id' });
  User.hasMany(Friendship, { foreignKey: 'friend_id' });

  // ChatMessage associations
  User.hasMany(ChatMessage, { foreignKey: 'sender_id' });
  User.hasMany(ChatMessage, { foreignKey: 'receiver_id' });

  // UserProfile associations
  User.hasOne(UserProfile, { foreignKey: 'user_id' });
  UserProfile.belongsTo(User, { foreignKey: 'user_id' });

  // Define Admin Model
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'admin'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { tableName: 'admins' });

  // Define AdminLog Model
  const AdminLog = sequelize.define('AdminLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    action_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    action_detail: {
      type: DataTypes.TEXT
    },
    target_id: {
      type: DataTypes.INTEGER
    },
    target_type: {
      type: DataTypes.STRING
    },
    ip_address: {
      type: DataTypes.STRING
    },
    user_agent: {
      type: DataTypes.TEXT
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { tableName: 'admin_logs' });

  // Define AIConversation Model
  const AIConversation = sequelize.define('AIConversation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    conversation_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tokens_used: {
      type: DataTypes.INTEGER
    },
    duration_ms: {
      type: DataTypes.INTEGER
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'completed'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { tableName: 'ai_conversations' });

  // Define SystemSetting Model
  const SystemSetting = sequelize.define('SystemSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    setting_key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    setting_value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    updated_by: {
      type: DataTypes.INTEGER
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { tableName: 'system_settings' });

  // Define AdminSession Model
  const AdminSession = sequelize.define('AdminSession', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    session_token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING
    },
    user_agent: {
      type: DataTypes.TEXT
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, { tableName: 'admin_sessions' });

  // Admin associations
  Admin.hasMany(AdminLog, { foreignKey: 'admin_id' });
  AdminLog.belongsTo(Admin, { foreignKey: 'admin_id' });
  
  Admin.hasMany(SystemSetting, { foreignKey: 'updated_by' });
  SystemSetting.belongsTo(Admin, { foreignKey: 'updated_by' });
  
  Admin.hasMany(AdminSession, { foreignKey: 'admin_id' });
  AdminSession.belongsTo(Admin, { foreignKey: 'admin_id' });
  
  User.hasMany(AIConversation, { foreignKey: 'user_id' });
  AIConversation.belongsTo(User, { foreignKey: 'user_id' });

  return {
    User,
    Note,
    Game,
    Strategy,
    Tag,
    StrategyTag,
    UserFavorite,
    UserHistory,
    CommunityChannel,
    CommunityMessage,
    Friendship,
    ChatMessage,
    UserProfile,
    Admin,
    AdminLog,
    AIConversation,
    SystemSetting,
    AdminSession
  };
}