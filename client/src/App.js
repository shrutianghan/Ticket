// App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [tickets, setTickets] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        createdBy: '',
        search: '',
        priority: 'Low',
    });
    const [filter, setFilter] = useState({
        status: 'All',
        priority: 'All',
    });

    const fetchTickets = async () => {
        try {
            const response = await
                fetch('http://localhost:5000/api/tickets');
            const data = await response.json();
            setTickets(data);
        } catch (error) {
            console.error(
                'Error fetching tickets:', error);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFilterChange = (e) => {
        setFilter({
            ...filter,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await
                fetch('http://localhost:5000/api/tickets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

            const newTicket = await response.json();
            setTickets([...tickets, newTicket]);
            setFormData({
                title: '',
                description: '',
                createdBy: '',
                search: '',
                priority: 'Low'
            });
        } catch (error) {
            console.error('Error creating ticket:', error);
        }
    };

    const handleSearch = async (query) => {
        // Trim white spaces and convert to lowercase
        const searchQuery = query.toLowerCase().trim();

        if (searchQuery !== '') {
            const searchedTickets = tickets.filter(
                (ticket) =>
                    ticket.title.toLowerCase().includes(searchQuery) ||
                    ticket.description.toLowerCase().includes(searchQuery) ||
                    ticket.createdBy.toLowerCase().includes(searchQuery)
            );

            setTickets(searchedTickets);
        } else {
            // If search query is empty, revert to original list of tickets
            fetchTickets(); // Refetch tickets from the server
        }
    };



    const handleDelete = async (ticketId) => {
        try {
            await
                fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
                    method: 'DELETE',
                });
            setTickets(tickets.filter((ticket) => ticket._id !== ticketId));
        } catch (error) {
            console.error('Error deleting ticket:', error);
        }
    };

    const handlePriorityChange = async (ticketId, newPriority) => {
        try {
            const response = await
                fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ priority: newPriority }),
                });

            const updatedTicket = await response.json();
            setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket._id === ticketId ? {
                        ...ticket,
                        priority: updatedTicket.priority
                    } : ticket
                )
            );
        } catch (error) {
            console.error('Error updating priority:', error);
        }
    };

    const filteredTickets = tickets.filter((ticket) => {
        const statusFilter =
            filter.status === 'All' ?
                true : ticket.status === filter.status;
        const priorityFilter =
            filter.priority === 'All' ?
                true : ticket.priority === filter.priority;

        return statusFilter && priorityFilter;
    });
    function getPriorityColor(priority) {
        switch (priority) {
            case 'Low':
                return '#aafaae'; // Green
            case 'Medium':
                return '#fcee68'; // Yellow
            case 'High':
                return '#fc8181'; // Red
            default:
                return '#fff'; // White for no priority
        }
    }
    return (
        <div className="App">
            <h1>Ticket Raising Platform</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Title:
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </label>
                <label>
                    Created By:
                    <input
                        type="text"
                        name="createdBy"
                        value={formData.createdBy}
                        onChange={handleInputChange}
                    />
                </label>
                <label>
                    Priority:
                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </label>
                <button type="submit">Submit</button>
            </form>

            <h2>FILTERS AND SEARCH</h2>
            <label>
                Status:
                <select name="status"
                    value={filter.status}
                    onChange={handleFilterChange}>
                    <option value="All">All</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
            </label>

            <label>
                Priority:
                <select name="priority"
                    value={filter.priority}
                    onChange={handleFilterChange}>
                    <option value="All">All</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </label>

            <label>
                Search:
                <input
                    type="text"
                    name="search"
                    value={formData.search}
                    onChange={(e) => {
                        setFormData({
                            ...formData,
                            search: e.target.value
                        }); // Update formData.search
                        // Invoke handleSearch with the input value
                        handleSearch(e.target.value);
                    }}
                />


            </label>


            <h2>Tickets</h2>
            <div className="card-container">
                {filteredTickets.map((ticket) => (
                    <div
                        key={ticket._id}
                        className="card"
                        style={{
                            backgroundColor: getPriorityColor(ticket.priority)
                        }}
                    >

                        <div className="card-content">

                            <strong>{ticket.title}</strong> <br />
                            {ticket.description}<br />
                            (Created by: {ticket.createdBy})
                        </div>
                        <br />
                        <div className="card-actions">
                            <span>Priority: {ticket.priority}</span>
                            <br />
                            <br />
                            <label>
                                Update Priority:
                                <br />
                                <br />

                                <select
                                    value={ticket.priority}
                                    onChange={(e) =>
                                        handlePriorityChange(ticket._id,
                                            e.target.value)
                                    }
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </label>
                            <button
                                onClick={() => handleDelete(ticket._id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
