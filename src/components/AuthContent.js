import React from 'react';
import { request, setAuthHeader } from '../helpers/axios_helper';

export default class AuthContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            currentPage: 1,
            usersPerPage: 5,
            showEditModal: false,
            showDeleteModal: false,
            currentUser: null,
            editedFirstName: '',
            editedLastName: '',
            editedLogin: '',
            searchTerm: '',
        };
        
    }

    componentDidMount() {
        this.fetchUsers();
    }

    fetchUsers = () => {
        request("GET", "/users", {}).then(
            (response) => {
                this.setState({ data: response.data });
            }
        ).catch((error) => {
            if (error.response.status === 401) {
                setAuthHeader(null);
            } else {
                this.setState({ data: error.response.code });
            }
        });
    }

    edit = (user) => {
        this.setState({
            currentUser: user,
            editedFirstName: user.firstName,
            editedLastName: user.lastName,
            editedLogin: user.login,
            showEditModal: true
        });
    };

    confirmEdit = () => {
        const { currentUser, editedFirstName, editedLastName, editedLogin } = this.state;
        this.onEdit(currentUser.id, editedFirstName, editedLastName, editedLogin);
        this.setState({ showEditModal: false });
    };

    onEdit = (id, firstName, lastName, login) => {
        request("PUT", `/users/${id}`, {
            firstName,
            lastName,
            login
        }).then((response) => {
            this.fetchUsers(); // Refresh the user list after editing
        }).catch((error) => {
            console.error("Error updating user:", error);
            if (error.response.status === 401) {
                setAuthHeader(null); // Clear the header if unauthorized
            }
        });
    };

    delete = (user) => {
        this.setState({ currentUser: user, showDeleteModal: true });
    };

    confirmDelete = () => {
        const { currentUser } = this.state;
        this.onDelete(currentUser.id);
        this.setState({ showDeleteModal: false });
    };

    onDelete = (id) => {
        request("DELETE", `/users/${id}`, {}).then((response) => {
            this.fetchUsers();
        }).catch((error) => {
            console.error("Error deleting user:", error);
        });
    };

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleSearchChange = (e) => {
        this.setState({ searchTerm: e.target.value });
    };
    getCurrentUsers = () => {
        const { data, currentPage, usersPerPage } = this.state;
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;
        return data.slice(indexOfFirstUser, indexOfLastUser);
    };
    
    getTotalPages = () => {
        const { data, usersPerPage } = this.state;
        return Math.ceil(data.length / usersPerPage);
    };
    render() {
        const currentUsers = this.getCurrentUsers();
        const totalPages = this.getTotalPages();
    
        // Filter data based on the search term
        const filteredData = currentUsers.filter(user =>
            user.login.toLowerCase().includes(this.state.searchTerm.toLowerCase())
        );
    
        return (
            <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <div className="row justify-content-md-center">
                    <div className="col-10">
                        <div className="card mt-4 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title text-center">User Management</h5>
                                <div className="col-2">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Search by username"
                                        value={this.state.searchTerm}
                                        onChange={this.handleSearchChange}
                                        style={{ border: '2px solid #007bff', borderRadius: '0.25rem', padding: '5px', fontSize: '0.9rem' }}
                                    />
                                </div>
                                </div>
                                <table className="table table-striped table-bordered">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th>First Name</th>
                                            <th>Last Name</th>
                                            <th>Username</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.firstName}</td>
                                                <td>{user.lastName}</td>
                                                <td>{user.login}</td>
                                                <td className="text-center">
                                                    <div className="btn-group" role="group">
                                                        <button className="btn btn-warning" onClick={() => this.edit(user)}>Edit</button>
                                                        <button className="btn btn-danger" onClick={() => this.delete(user)}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
    
                                {/* Pagination Controls */}
                                <nav aria-label="Page navigation">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${this.state.currentPage === 1 ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => this.setState({ currentPage: this.state.currentPage - 1 })}>
                                                Previous
                                            </button>
                                        </li>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <li key={index} className={`page-item ${this.state.currentPage === index + 1 ? 'active' : ''}`}>
                                                <button className="page-link" onClick={() => this.setState({ currentPage: index + 1 })}>
                                                    {index + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${this.state.currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button className="page-link" onClick={() => this.setState({ currentPage: this.state.currentPage + 1 })}>
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
    
                                {/* Edit and Delete Modals here */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
}