// AdminDashboard.js

import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editableRows, setEditableRows] = useState({});

  useEffect(() => {
    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        updatePaginationInfo(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const pageSize = 10;

  const updatePaginationInfo = (data) => {
    setTotalPages(Math.ceil(data.length / pageSize));
  };

  const filteredUsers = () => {
    // Apply search filter
    const filteredData = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  };

  const handleSearch = () => {
    // Update pagination info based on search results
    updatePaginationInfo(filteredUsers());
  };

  const toggleSelectAll = () => {
    const allUserIds = filteredUsers().map(user => user.id);
    if (selectedRows.length === pageSize) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allUserIds);
    }
  };

  const toggleSelectRow = (userId) => {
    setSelectedRows(prevSelectedRows => {
      if (prevSelectedRows.includes(userId)) {
        return prevSelectedRows.filter(id => id !== userId);
      } else {
        return [...prevSelectedRows, userId];
      }
    });
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const deleteSelected = () => {
    const updatedUsers = users.filter(user => !selectedRows.includes(user.id));
    setUsers(updatedUsers);
    setSelectedRows([]);
    setEditableRows({});
    updatePaginationInfo(updatedUsers);
  };

  const deleteRow = (userId) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    setSelectedRows([]);
    setEditableRows({});
    updatePaginationInfo(updatedUsers);
  };

  const toggleEdit = (userId) => {
    setEditableRows(prevEditableRows => ({
      ...prevEditableRows,
      [userId]: !prevEditableRows[userId],
    }));
  };

  const saveEdit = (userId, updatedUserData) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, ...updatedUserData } : user
    );
    setUsers(updatedUsers);
    toggleEdit(userId);
  };

  return (
    <div className="admin-dashboard-container">
      <div className="search-bar">
        <input
          type="text"
          id="search"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-icon" onClick={handleSearch}>
          Search
        </button>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedRows.length === pageSize}
                onChange={toggleSelectAll}
              />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers().map(user => (
            <tr key={user.id} className={selectedRows.includes(user.id) ? 'selected' : ''}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(user.id)}
                  onChange={() => toggleSelectRow(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td>
                {editableRows[user.id] ? (
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => {
                      const updatedName = e.target.value;
                      setEditableRows(prevEditableRows => ({
                        ...prevEditableRows,
                        [user.id]: { ...prevEditableRows[user.id], name: updatedName },
                      }));
                    }}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {editableRows[user.id] ? (
                  <input
                    type="text"
                    value={user.email}
                    onChange={(e) => {
                      const updatedEmail = e.target.value;
                      setEditableRows(prevEditableRows => ({
                        ...prevEditableRows,
                        [user.id]: { ...prevEditableRows[user.id], email: updatedEmail },
                      }));
                    }}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editableRows[user.id] ? (
                  <input
                    type="text"
                    value={user.role}
                    onChange={(e) => {
                      const updatedRole = e.target.value;
                      setEditableRows(prevEditableRows => ({
                        ...prevEditableRows,
                        [user.id]: { ...prevEditableRows[user.id], role: updatedRole },
                      }));
                    }}
                  />
                ) : (
                  user.role
                )}
              </td>
              <td>
              {editableRows[user.id] ?
                <button onClick={()=>saveEdit(user.id,user.data)}>Save</button> : <button className="edit" onClick={() => toggleEdit(user.id)}>
                   Edit
                </button>}
                <button className="delete" onClick={() => deleteRow(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => goToPage(1)}>First Page</button>
        <button onClick={goToPreviousPage}>Previous Page</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={goToNextPage}>Next Page</button>
        <button onClick={() => goToPage(totalPages)}>Last Page</button>
      </div>

      <button className="delete-selected" onClick={deleteSelected}>
        Delete Selected
      </button>
    </div>
  );
};

export default AdminDashboard;
