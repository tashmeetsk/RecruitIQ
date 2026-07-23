import { Router, type IRouter } from "express";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SHARED_PASSWORD = "AlliedVista";

const KNOWN_USERS = [
  { id: 1, name: "Tashmeet", email: "tashmeetkatara@gmail.com" },
  { id: 2, name: "Triansh", email: "trianshk@gmail.com" },
  { id: 3, name: "Sourabh", email: "sourabh987159@gmail.com" },
];

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const user = KNOWN_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );

  if (!user || password !== SHARED_PASSWORD) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  (req.session as any).user = user;
  res.json(user);
});

router.get("/auth/me", (req, res): void => {
  const user = (req.session as any)?.user;
  if (!user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  res.json(user);
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;
