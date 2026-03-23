import express from "express";
import cors from "cors";
import db from "./db/connexionBdd.js";
import employeRoutes from "./routes/employe.routes.js";
import magasinRoutes from "./routes/magasin.routes.js";
import typeContratRoutes from "./routes/typeContrat.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Connexion a la base de donnees reussie.");
  })
  .catch((err) => {
    console.error("Erreur de connexion a la base de donnees :", err);
  });

app.use("/api/employes", employeRoutes);
app.use("/api/magasins", magasinRoutes);
app.use("/api/typeContrats", typeContratRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur API demarre sur http://localhost:${PORT}.`);
});
