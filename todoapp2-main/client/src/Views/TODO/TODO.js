import { useEffect, useState } from 'react'
import Styles from './TODO.module.css'
import { dummy } from './dummy'
import axios from 'axios';

export function TODO(props) {

    const [newTodo, setNewTodo] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [todoData, setTodoData] = useState(dummy);
    const [loading, setLoading] = useState(true);
    const [editTodo, setEditTodo] = useState(null);

    useEffect(() => {
        const fetchTodo = async () => {
            const apiData = await getTodo()
            setTodoData(apiData);
            setLoading(false)
        }
        fetchTodo();
    }, [])

    const getTodo = async () => {
        const options = {
            method: "GET",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            }
        }
        try {
            const response = await axios.request(options)
            return response.data
        } catch (err) {
            console.log(err);
            return []; // return an empty array in case of error
        }
    }

    const addTodo = () => {
        const options = {
            method: "POST",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            },
            data: {
                title: newTodo,
                description: newDescription
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data)
                setTodoData(prevData => [...prevData, response.data.newTodo])
                setNewTodo('');
                setNewDescription('');
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const deleteTodo = (id) => {
        const options = {
            method: "DELETE",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data)
                setTodoData(prevData => prevData.filter(todo => todo._id !== id))
            })
            .catch((err) => {
                console.log(err)
            })
    };

    const updateTodo = (id) => {
        const todoToUpdate = todoData.find(todo => todo._id === id)
        const options = {
            method: "PATCH",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            },
            data: {
                ...todoToUpdate,
                done: !todoToUpdate.done
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data)
                setTodoData(prevData => prevData.map(todo => todo._id === id ? response.data : todo))
            })
            .catch((err) => {
                console.log(err)
            })
    };

    const editExistingTodo = (id, newTitle, newDescription) => {
        const options = {
            method: "PATCH",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            },
            data: {
                title: newTitle,
                description: newDescription
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data)
                setTodoData(prevData => prevData.map(todo => todo._id === id ? response.data : todo))
                setEditTodo(null); // reset editTodo state
            })
            .catch((err) => {
                console.log(err)
            })
    };

    return (
        <div className={Styles.ancestorContainer}>
            <div className={Styles.headerContainer}>
                <h1>
                    Tasks
                </h1>
                <span>
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Todo'
                        value={newTodo}
                        onChange={(event) => {
                            setNewTodo(event.target.value)
                        }}
                        placeholder="Task Title"
                    />
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Description'
                        value={newDescription}
                        onChange={(event) => {
                            setNewDescription(event.target.value)
                        }}
                        placeholder="Task Description"
                    />
                    <button
                        id='addButton'
                        name='add'
                        className={Styles.addButton}
                        onClick={() => {
                            addTodo()
                        }}
                    >
                        + New Todo
                    </button>
                </span>
            </div>
            <div id='todoContainer' className={Styles.todoContainer}>
                {loading ? (
                    <p style={{ color: 'white' }}>Loading...</p>
                ) : (
                    todoData.length > 0 ? (
                        todoData.map((entry, index) => (
                            <div key={entry._id} className={Styles.todo}>
                                {editTodo === entry._id ? (
                                    <span className={Styles.infoContainer}>
                                        <input
                                            type='text'
                                            value={entry.title}
                                            onChange={(e) => {
                                                const updatedTodo = { ...entry, title: e.target.value };
                                                setTodoData(prevData => prevData.map(todo => todo._id === entry._id ? updatedTodo : todo));
                                            }}
                                            placeholder="Task Title"
                                        />
                                        <input
                                            type='text'
                                            value={entry.description}
                                            onChange={(e) => {
                                                const updatedTodo = { ...entry, description: e.target.value };
                                                setTodoData(prevData => prevData.map(todo => todo._id === entry._id ? updatedTodo : todo));
                                            }}
                                            placeholder="Task Description"
                                        />
                                        <button
                                            onClick={() => editExistingTodo(entry._id, entry.title, entry.description)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditTodo(null)}
                                        >
                                            Cancel
                                        </button>
                                    </span>
                                ) : (
                                    <span className={Styles.infoContainer}>
                                        <input
                                            type='checkbox'
                                            checked={entry.done}
                                            onChange={() => {
                                                updateTodo(entry._id);
                                            }}
                                        />
                                        <span>{entry.title}</span>
                                        <span>{entry.description}</span>
                                        <button onClick={() => setEditTodo(entry._id)}>
                                            Edit
                                        </button>
                                    </span>
                                )}
                                <span
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        deleteTodo(entry._id);
                                    }}
                                >
                                    Delete
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className={Styles.noTodoMessage}>No tasks available. Please add a new task.</p>
                    )
                )}
            </div>
        </div>
    )
}
