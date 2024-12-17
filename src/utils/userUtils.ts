import userModels from "../models/user";

export const deductCredits = async (userId: string, credits: number = 10): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await userModels.getUserById(userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.credits < credits) {
      return { success: false, message: "Insufficient credits" };
    }

    await userModels.updateUser(userId, { credits: user.credits - credits });

    console.log(`Deducted ${credits} credits from user ${userId}`);

    return { success: true, message: "Credits deducted successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to deduct credits" };
  }
};
