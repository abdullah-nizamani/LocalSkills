import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaCheck, FaTimes, FaFlag, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ContentModeration = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filterStatus]);

  const fetchReports = async () => {
    try {
      // Mock data - replace with actual API call
      const mockReports = [
        {
          id: 1,
          type: 'skill',
          contentId: 1,
          contentTitle: 'Suspicious Plumbing Service',
          reporter: { name: 'John Doe', email: 'john@example.com' },
          reason: 'Inappropriate content',
          description: 'This skill post contains misleading information and potentially harmful advice.',
          status: 'pending',
          priority: 'high',
          createdAt: '2024-01-15',
          content: {
            title: 'Professional Plumbing Services',
            description: 'I can fix any plumbing issue with my magical tools!',
            provider: 'Suspicious User'
          }
        },
        {
          id: 2,
          type: 'user',
          contentId: 2,
          contentTitle: 'Spam Account Report',
          reporter: { name: 'Jane Smith', email: 'jane@example.com' },
          reason: 'Spam',
          description: 'This user is posting spam messages and fake skills.',
          status: 'reviewed',
          priority: 'medium',
          createdAt: '2024-01-14',
          content: {
            name: 'Spam User',
            email: 'spam@example.com',
            userType: 'worker'
          }
        },
        {
          id: 3,
          type: 'skill',
          contentId: 3,
          contentTitle: 'Copyright Violation',
          reporter: { name: 'Mike Johnson', email: 'mike@example.com' },
          reason: 'Copyright infringement',
          description: 'This skill post uses copyrighted images without permission.',
          status: 'pending',
          priority: 'low',
          createdAt: '2024-01-13',
          content: {
            title: 'Photography Services',
            description: 'Professional photography with stunning results.',
            provider: 'Photo Expert'
          }
        }
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.contentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reporter.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    setFilteredReports(filtered);
  };

  const handleStatusUpdate = async (reportId, newStatus, action = null) => {
    try {
      // Mock API call - replace with actual API
      const updatedReports = reports.map(report =>
        report.id === reportId ? { ...report, status: newStatus } : report
      );
      setReports(updatedReports);

      let message = `Report marked as ${newStatus}`;
      if (action) {
        message += ` and content ${action}`;
      }
      toast.success(message);
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    }
  };

  const handleViewContent = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
        <div className="text-sm text-gray-500">
          Total Reports: {reports.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by content, description, or reporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.contentTitle}</div>
                      <div className="text-sm text-gray-500">{report.reason}</div>
                      <div className="text-xs text-gray-400 mt-1">{report.createdAt}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      report.type === 'skill' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.reporter.name}</div>
                    <div className="text-sm text-gray-500">{report.reporter.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewContent(report)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="View Content"
                      >
                        <FaEye size={16} />
                      </button>
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(report.id, 'resolved', 'removed')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-md"
                            title="Approve & Remove Content"
                          >
                            <FaCheck size={16} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                            title="Dismiss Report"
                          >
                            <FaTimes size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FaFlag size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Content Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Reported Content</h4>
                  <p className="text-sm text-gray-600">{selectedReport.contentTitle}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Reason</h4>
                  <p className="text-sm text-gray-600">{selectedReport.reason}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Description</h4>
                  <p className="text-sm text-gray-600">{selectedReport.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Content Details</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {selectedReport.type === 'skill' ? (
                      <div>
                        <p><strong>Title:</strong> {selectedReport.content.title}</p>
                        <p><strong>Description:</strong> {selectedReport.content.description}</p>
                        <p><strong>Provider:</strong> {selectedReport.content.provider}</p>
                      </div>
                    ) : (
                      <div>
                        <p><strong>Name:</strong> {selectedReport.content.name}</p>
                        <p><strong>Email:</strong> {selectedReport.content.email}</p>
                        <p><strong>Type:</strong> {selectedReport.content.userType}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                {selectedReport.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReport.id, 'resolved', 'removed');
                        setShowModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove Content
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedReport.id, 'dismissed');
                        setShowModal(false);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Dismiss Report
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentModeration;