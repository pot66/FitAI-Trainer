const prisma = require("../services/prisma");
const { generateAIResponse } = require("../services/aiService");

async function createChatSession(req, res) {
    try {
        const { title } = req.body;

        const session = await prisma.chatSession.create({
            data: {
                userId: req.user.userId,
                title: title || "New Chat",
            },
        });

        return res.status(201).json({
            success: true,
            message: "Chat session created",
            data: session,
        });
    } catch (error) {
        console.error("Create chat session error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

async function getMyChatSessions(req, res) {
    try {
        const sessions = await prisma.chatSession.findMany({
            where: {
                userId: req.user.userId,
            },

            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },

            orderBy: {
                updatedAt: "desc",
            },
        });

        return res.json({
            success: true,
            data: sessions,
        });
    } catch (error) {
        console.error("Get chat sessions error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

async function sendMessage(req, res) {
  try {
    const { sessionId, message, activePlan, planUpdated } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: "sessionId and message are required",
      });
    }

    const session = await prisma.chatSession.findFirst({
      where: {
        id: Number(sessionId),
        userId: req.user.userId,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    // บันทึกข้อความของ User
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: message,
      },
    });

    // ดึงข้อมูล Profile
    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.user.userId,
      },
    });

    // ดึงประวัติการออกกำลังกาย
    const workout = await prisma.workoutSession.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        exercise: true,
      },
      orderBy: {
        startedAt: "desc",
      },
      take: 10,
    });

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0); const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const todayFoodLogs = await prisma.foodLog.findMany({ where: { userId: req.user.userId, loggedAt: { gte: todayStart, lte: todayEnd } }, include: { items: true }, orderBy: { loggedAt: 'asc' } });

    // ส่งข้อมูลให้ Local AI
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const aiResponse = await generateAIResponse(message, {
      profile,
      workout,
      foodLogs: todayFoodLogs,
      history: history.reverse().slice(0, -1),
      activePlan,
      planUpdated: Boolean(planUpdated),
    });

    // บันทึกคำตอบ AI
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: aiResponse,
      },
    });

    return res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      success: false,
      message: "Chat service error",
      error: error.message,
    });
  }
}
// =====================================
// Rename Chat Session
// =====================================

async function renameChatSession(req, res) {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Chat title is required",
            });
        }

        const session = await prisma.chatSession.findFirst({
            where: {
                id: Number(id),
                userId: req.user.userId,
            },
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Chat session not found",
            });
        }

        const updatedSession =
            await prisma.chatSession.update({
                where: {
                    id: session.id,
                },

                data: {
                    title: title.trim(),
                },
            });

        return res.json({
            success: true,
            message: "Chat renamed successfully",
            data: updatedSession,
        });

    } catch (error) {
        console.error(
            "Rename chat session error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// =====================================
// Delete Chat Session
// =====================================

async function deleteChatSession(req, res) {
    try {
        const { id } = req.params;

        const session =
            await prisma.chatSession.findFirst({
                where: {
                    id: Number(id),
                    userId: req.user.userId,
                },
            });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Chat session not found",
            });
        }

        // ลบข้อความทั้งหมดก่อน
        await prisma.chatMessage.deleteMany({
            where: {
                sessionId: session.id,
            },
        });

        // ลบ Session
        await prisma.chatSession.delete({
            where: {
                id: session.id,
            },
        });

        return res.json({
            success: true,
            message: "Chat deleted successfully",
        });

    } catch (error) {
        console.error(
            "Delete chat session error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

module.exports = {
    createChatSession,
    getMyChatSessions,
    sendMessage,
    renameChatSession,
    deleteChatSession,
};
