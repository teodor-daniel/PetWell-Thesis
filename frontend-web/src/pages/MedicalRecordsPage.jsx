import { Badge, Button, Container, Group, Paper, Table, Text, Title } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const API = process.env.REACT_APP_API_URL;

const MedicalRecords = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchRecords();
    }
  }, [user?.id]);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${API}/api/medical-record/user/${user.id}`, {
        withCredentials: true
      });
      setRecords(response.data);
    } catch (err) {
      console.error('Failed to load medical records:', err);
      setError('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (recordId) => {
    try {
      const { data } = await axios.get(`${API}/api/medical-record/download/${recordId}`, {
        withCredentials: true
      });
      window.open(data, '_blank');
    } catch (err) {
      console.error('Failed to download record:', err);
      setError('Failed to download record');
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Text>Loading medical records...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">My Medical Records</Title>

      {error && (
        <Text color="red" size="sm" mb="md">
          {error}
        </Text>
      )}

      <Paper shadow="sm" p="lg" withBorder>
        {records.length === 0 ? (
          <Text color="dimmed" align="center">No medical records found.</Text>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Pet Name</th>
                <th>File Name</th>
                <th>Uploaded By</th>
                <th>Clinic</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.petName}</td>
                  <td>{record.fileName}</td>
                  <td>{record.uploaderUserName || record.vetName || 'Unknown'}</td>
                  <td>{record.clinicName || 'N/A'}</td>
                  <td>{record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <Button
                      size="xs"
                      leftSection={<IconDownload size={14} />}
                      onClick={() => handleDownload(record.id)}
                    >
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Paper>
    </Container>
  );
};

export default MedicalRecords; 