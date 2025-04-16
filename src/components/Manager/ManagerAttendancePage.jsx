// import React, { useState, useEffect } from "react";
// import { Table, message } from "antd";
// import SockJS from "sockjs-client";
// import { over } from "stompjs";

// const ManagerAttendancePage = () => {
//   const [attendanceRecords, setAttendanceRecords] = useState([]);
//   const [stompClient, setStompClient] = useState(null);

//   useEffect(() => {
//     // Fetch initial attendance data
//     fetchAttendanceData();

//     // Setup WebSocket connection
//     setupWebSocket();

//     return () => {
//       if (stompClient) {
//         stompClient.disconnect();
//       }
//     };
//   }, []);

//   const fetchAttendanceData = async () => {
//     try {
//       const response = await fetch("http://localhost:8092/api/attendance/all");
//       const data = await response.json();
//       setAttendanceRecords(data);
//     } catch (error) {
//       console.error("Error fetching attendance data:", error);
//     }
//   };

//   const setupWebSocket = () => {
//     const socket = new SockJS("http://localhost:8092/ws-attendance");
//     const client = over(socket);

//     client.connect({}, () => {
//       client.subscribe("/topic/new-attendance", (message) => {
//         const newRecord = JSON.parse(message.body);
//         setAttendanceRecords((prev) => [newRecord, ...prev]);
//         showNotification(newRecord);
//       });
//     });

//     setStompClient(client);
//   };

//   const showNotification = (record) => {
//     message.success(
//       `${record.employee.name} has checked in (${record.attendanceType.name})`,
//     );
//   };

//   const columns = [
//     {
//       title: "Employee",
//       dataIndex: ["employee", "name"],
//       key: "employee",
//     },
//     {
//       title: "Type",
//       dataIndex: ["attendanceType", "name"],
//       key: "type",
//     },
//     {
//       title: "Time",
//       dataIndex: "timestamp",
//       key: "time",
//       render: (time) => new Date(time).toLocaleString(),
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//     },
//   ];

//   return (
//     <div>
//       <h1>Real-time Attendance Monitoring</h1>
//       <Table
//         dataSource={attendanceRecords}
//         columns={columns}
//         rowKey="id"
//         pagination={{ pageSize: 10 }}
//       />
//     </div>
//   );
// };

// export default ManagerAttendancePage;
