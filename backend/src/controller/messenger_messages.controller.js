import db from "../db/connexionBdd.js";

const MessengerMessages = db.models["messenger_messages"];

export const getAllMessengerMessages = async (req, res) => {
  try {
    const allMessengerMessages = await MessengerMessages.findAll();
    res.status(200).json(allMessengerMessages);
  } catch (error) {
    console.error("Erreur lors de la recuperation des messenger_messages :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des messenger_messages.",
    });
  }
};

export const createMessengerMessages = async (req, res) => {
  try {
    const newMessengerMessages = await MessengerMessages.create(req.body);
    res.status(201).json(newMessengerMessages);
  } catch (error) {
    console.error("Erreur lors de la creation de messenger_messages :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de messenger_messages.",
    });
  }
};

