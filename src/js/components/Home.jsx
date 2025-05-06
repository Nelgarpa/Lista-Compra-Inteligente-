import React, { useState, useEffect } from "react";
import "../../styles/index.css";

const categorias = [
	{ nombre: "Frutas", icono: "🍎" },
	{ nombre: "Lácteos", icono: "🥛" },
	{ nombre: "Carnes", icono: "🍖" },
	{ nombre: "Panadería", icono: "🥖" },
	{ nombre: "Limpieza", icono: "🧽" },
	{ nombre: "Chuches", icono: "🍬" },
	{ nombre: "Congelados", icono: "🧊" },
	{ nombre: "Bebidas", icono: "🥤" },
	{ nombre: "Otros", icono: "📃" },
];

const Home = () => {
	const [input, setInput] = useState("");
	const [categoria, setCategoria] = useState("Frutas");
	const [tareas, setTareas] = useState([]);

	useEffect(() => {
		crearAgenda();
	}, []);

	const crearAgenda = () => {
		fetch("https://playground.4geeks.com/todo/users/nelcy", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username: "nelcy" }),
		})
			.then((response) => {
				if (response.status === 400) {
					getTodos();
					return;
				}
				return response.json();
			})
			.catch((error) => console.error("Error al crear agenda:", error));
	};

	const crearTodo = () => {
		const bodyEnviado = {
			label: `${input} (${categoria})`,
			is_done: false,
		};

		fetch("https://playground.4geeks.com/todo/todos/nelcy", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(bodyEnviado),
		})
			.then((response) => response.json())
			.then(() => {
				getTodos();
				setInput("");
			})
			.catch((error) => console.error("Error al crear tarea:", error));
	};

	const getTodos = () => {
		fetch("https://playground.4geeks.com/todo/users/nelcy", {
			method: "GET",
		})
			.then((response) => response.json())
			.then((data) => setTareas(data.todos))
			.catch((error) => console.error("Error al obtener tareas:", error));
	};

	const handleClick = () => {
		if (input.trim() === "") return;
		crearTodo();
	};

	const handleDelete = (tarea) => {
		fetch(`https://playground.4geeks.com/todo/todos/${tarea.id}`, {
			method: "DELETE",
		})
			.then(() => getTodos())
			.catch((error) => console.error("Error al eliminar tarea:", error));
	};

	const handleClearAll = () => {
		Promise.all(
			tareas.map((tarea) =>
				fetch(`https://playground.4geeks.com/todo/todos/${tarea.id}`, {
					method: "DELETE",
				})
			)
		)
			.then(() => getTodos())
			.catch((error) => console.error("Error al limpiar tareas:", error));
	};

	const tareasPorCategoria = categorias.reduce((acc, cat) => {
		acc[cat.nombre] = tareas.filter((t) => t.label.includes(`(${cat.nombre})`));
		return acc;
	}, {});

	return (
		<div className="container">
			<h1>🛍️ Lista de la Compra Inteligente</h1>
			<div className="input">
				<input
					type="text"
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleClick()}
					value={input}
					placeholder="Ej: Manzanas"
				/>
				<select onChange={(e) => setCategoria(e.target.value)} value={categoria}>
					{categorias.map((cat, i) => (
						<option key={i} value={cat.nombre}>
							{cat.icono} {cat.nombre}
						</option>
					))}
				</select>
				<button onClick={handleClick}>Agregar</button>
				<button className="clear" onClick={handleClearAll}>Limpiar Todo</button>
			</div>

			<div className="category-list">
				{categorias.map((cat, index) => (
					<div key={index} className="category">
						<h2>{cat.icono} {cat.nombre}</h2>
						<ul>
							{tareasPorCategoria[cat.nombre]?.length > 0 ? (
								tareasPorCategoria[cat.nombre].map((tarea, i) => (
									<li key={i} className="full-list">
										<span>{tarea.label.replace(` (${cat.nombre})`, "")}</span>
										<button onClick={() => handleDelete(tarea)}>✖</button>
									</li>
								))
							) : (
								<li className="no-task">Sin productos</li>
							)}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
};

export default Home;
