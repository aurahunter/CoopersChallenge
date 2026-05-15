import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: [{ done: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return res.json({ tasks });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao listar tarefas" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title } = req.body ?? {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "Título é obrigatório" });
    }
    const maxOrder = await prisma.task.aggregate({
      where: { userId: req.userId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const task = await prisma.task.create({
      data: {
        userId: req.userId,
        title: String(title).trim(),
        sortOrder,
      },
    });
    return res.status(201).json({ task });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao criar tarefa" });
  }
});

router.patch("/reorder", async (req, res) => {
  try {
    const { orderedIds } = req.body ?? {};
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ error: "orderedIds deve ser um array de ids" });
    }
    const ids = orderedIds.map((id) => String(id));
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId, id: { in: ids } },
      select: { id: true },
    });
    if (tasks.length !== ids.length) {
      return res.status(400).json({ error: "Algum id não pertence ao usuário" });
    }
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.task.update({
          where: { id, userId: req.userId },
          data: { sortOrder: index },
        })
      )
    );
    const updated = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: [{ done: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return res.json({ tasks: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao reordenar" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, done, sortOrder } = req.body ?? {};
    const data = {};
    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ error: "Título não pode ser vazio" });
      }
      data.title = String(title).trim();
    }
    if (done !== undefined) {
      data.done = Boolean(done);
    }
    if (sortOrder !== undefined) {
      data.sortOrder = Number(sortOrder);
      if (Number.isNaN(data.sortOrder)) {
        return res.status(400).json({ error: "sortOrder inválido" });
      }
    }
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Nada para atualizar" });
    }
    const task = await prisma.task.updateMany({
      where: { id, userId: req.userId },
      data,
    });
    if (task.count === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    const updated = await prisma.task.findFirst({
      where: { id, userId: req.userId },
    });
    return res.json({ task: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await prisma.task.deleteMany({
      where: { id, userId: req.userId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro ao remover tarefa" });
  }
});

export default router;
