import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../../api.js";
import "./todo.css";

function TaskRow({
  task,
  variant,
  rowRef,
  rowStyle,
  dragHandleListeners,
  dragHandleAttributes,
  isDragging,
  isEditing,
  draft,
  onDraftChange,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onToggle,
  onDelete,
}) {
  const hasDrag = Boolean(dragHandleListeners);

  function handleKeyDown(e) {
    if (!isEditing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      onCommitEdit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancelEdit();
    }
  }

  return (
    <li
      ref={rowRef}
      style={rowStyle}
      className={`task-row task-row--${variant}${hasDrag ? " task-row--with-drag" : ""}${isDragging ? " task-row--dragging" : ""}`}
    >
      {hasDrag ? (
        <button
          type="button"
          className="task-row__drag"
          {...dragHandleListeners}
          {...dragHandleAttributes}
          aria-label="Arrastar para reordenar"
        >
          <span className="task-row__drag-icon" aria-hidden="true" />
        </button>
      ) : null}

      <label className="task-row__check">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task)}
          aria-label={task.done ? "Marcar como pendente" : "Marcar como concluída"}
        />
        <span className="task-row__check-ui" aria-hidden="true" />
      </label>

      <div className="task-row__body">
        {isEditing ? (
          <input
            className="task-row__input"
            type="text"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onBlur={onCommitEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="Editar título da tarefa"
          />
        ) : (
          <button
            type="button"
            className="task-row__title"
            onClick={() => onStartEdit(task)}
          >
            {task.title}
          </button>
        )}
      </div>

      <button
        type="button"
        className="task-row__delete"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onDelete(task)}
        aria-label={`Remover: ${task.title}`}
      >
        delete
      </button>
    </li>
  );
}

function SortableTaskRow({ task, editingId, ...rest }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: editingId === task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TaskRow
      {...rest}
      task={task}
      variant="pending"
      rowRef={setNodeRef}
      rowStyle={style}
      dragHandleListeners={listeners}
      dragHandleAttributes={attributes}
      isDragging={isDragging}
      isEditing={editingId === task.id}
    />
  );
}

export default function TodoBoard({ embedded = false }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTaskList = useCallback(async () => {
    const data = await api("/api/tasks");
    return data.tasks ?? [];
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const list = await fetchTaskList();
        if (!cancelled) {
          setTasks(list);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Erro ao carregar tarefas");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchTaskList]);

  const loadTasks = useCallback(async () => {
    setError("");
    try {
      const list = await fetchTaskList();
      setTasks(list);
    } catch (e) {
      setError(e.message || "Erro ao carregar tarefas");
    }
  }, [fetchTaskList]);

  const activeTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);
  const doneCount = doneTasks.length;
  const sortableIds = activeTasks.map((t) => t.id);

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const act = tasks.filter((t) => !t.done);
    const oldIndex = act.findIndex((t) => t.id === active.id);
    const newIndex = act.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(act, oldIndex, newIndex);
    const orderedIds = reordered.map((t) => t.id);

    setError("");
    try {
      await api("/api/tasks/reorder", {
        method: "PATCH",
        body: JSON.stringify({ orderedIds }),
      });
      await loadTasks();
    } catch (err) {
      setError(err.message || "Erro ao reordenar");
      await loadTasks();
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setAdding(true);
    setError("");
    try {
      await api("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setNewTitle("");
      await loadTasks();
    } catch (err) {
      setError(err.message || "Erro ao criar");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(task) {
    setError("");
    try {
      await api(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ done: !task.done }),
      });
      await loadTasks();
    } catch (err) {
      setError(err.message || "Erro ao atualizar");
    }
  }

  async function handleDelete(task) {
    setError("");
    try {
      await api(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (editingId === task.id) {
        setEditingId(null);
      }
      await loadTasks();
    } catch (err) {
      setError(err.message || "Erro ao remover");
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditDraft(task.title);
  }

  async function commitEdit() {
    if (!editingId) return;
    const title = editDraft.trim();
    const task = tasks.find((t) => t.id === editingId);
    setEditingId(null);
    if (!task || title === task.title) return;
    if (!title) {
      await loadTasks();
      return;
    }
    setError("");
    try {
      await api(`/api/tasks/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      await loadTasks();
    } catch (err) {
      setError(err.message || "Erro ao salvar");
      await loadTasks();
    }
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function eraseAll(list) {
    const label = list === "active" ? "todas as pendentes" : "todas as concluídas";
    if (!window.confirm(`Apagar ${label}?`)) return;
    setError("");
    const toRemove = list === "active" ? activeTasks : doneTasks;
    try {
      await Promise.all(toRemove.map((t) => api(`/api/tasks/${t.id}`, { method: "DELETE" })));
      setEditingId(null);
      await loadTasks();
    } catch (err) {
      setError(err.message || "Erro ao apagar");
      await loadTasks();
    }
  }

  const rowProps = {
    draft: editDraft,
    onDraftChange: setEditDraft,
    onStartEdit: startEdit,
    onCommitEdit: commitEdit,
    onCancelEdit: cancelEdit,
    onToggle: handleToggle,
    onDelete: handleDelete,
  };

  return (
    <section
      className="todo-board"
      aria-labelledby={embedded ? undefined : "todo-board-title"}
    >
      {!embedded ? (
        <>
          <h2 id="todo-board-title" className="todo-board__heading">
            To-do List
          </h2>
          <p className="todo-board__intro">
            Arraste pelo ícone à esquerda para definir prioridades (salva no servidor). Clique no
            texto para editar; passe o mouse para apagar.
          </p>
        </>
      ) : null}

      {error ? (
        <p className="todo-board__error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="todo-board__loading">Carregando tarefas…</p>
      ) : (
        <div className="todo-board__columns">
          <article className="todo-card todo-card--pending">
            <header className="todo-card__head">
              <h3 className="todo-card__title">To-do</h3>
              <p className="todo-card__subtitle">Take a breath. Start doing.</p>
            </header>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                <ul className="todo-card__list">
                  {activeTasks.length === 0 ? (
                    <li className="todo-card__empty">Nenhuma tarefa pendente.</li>
                  ) : null}
                  {activeTasks.map((task) => (
                    <SortableTaskRow key={task.id} task={task} editingId={editingId} {...rowProps} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>

            <form className="todo-card__add" onSubmit={handleAdd}>
              <label htmlFor="new-task-title" className="visually-hidden">
                Nova tarefa
              </label>
              <input
                id="new-task-title"
                type="text"
                placeholder="Novo item…"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={adding}
              />
              <button type="submit" className="todo-card__add-btn" disabled={adding || !newTitle.trim()}>
                Adicionar
              </button>
            </form>
            <button type="button" className="todo-card__erase" onClick={() => eraseAll("active")}>
              erase all
            </button>
          </article>

          <article className="todo-card todo-card--done">
            <header className="todo-card__head">
              <h3 className="todo-card__title">Done</h3>
              <p className="todo-card__subtitle">
                Congratulations! You have done {doneCount} task{doneCount === 1 ? "" : "s"}
              </p>
            </header>
            <ul className="todo-card__list">
              {doneTasks.length === 0 ? (
                <li className="todo-card__empty">Nada concluído ainda.</li>
              ) : null}
              {doneTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  variant="done"
                  isEditing={editingId === task.id}
                  {...rowProps}
                />
              ))}
            </ul>
            <button type="button" className="todo-card__erase" onClick={() => eraseAll("done")}>
              erase all
            </button>
          </article>
        </div>
      )}
    </section>
  );
}
