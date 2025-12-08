import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Users, Clock,  Calendar, CheckCircle, Timer, Trash} from 'lucide-react';
import {  useNavigate } from "react-router-dom";
import axios from "axios";



interface MeetingsIF{
    isActive: boolean,
    meeting_time_ist: string,
    password: string,
    participants: string[],
    MEETING_ID: string,
    owner: string,
    description: string,
    meetingLink: string,
    duration: number,
    title: string,
    status: string,
    date: string,
    time: string,
    studentIds: string,
    share_url: string
};


interface TrasnactionsIF{
    
    transaction_id: string,
    amount: number,
    date: number,
    student_id: string,
};


export default function DashBoard() {

    const [transactions, setTransactions] = useState<TrasnactionsIF[]>([]);

    // const transactions = [
    //     { id: 'TXN-2024-001', date: 'Nov 15', amount: 299, type: 'payment', description: '100-Day Cycle Payment' },
    //     { id: 'TXN-2024-002', date: 'Aug 17', amount: 299, type: 'payment', description: '100-Day Cycle Payment' },
    //     { id: 'TXN-2023-003', date: 'May 20', amount: 299, type: 'payment', description: '100-Day Cycle Payment' }
    // ];




    const [historicMeetings, setHistoricMeetings] = useState<MeetingsIF[]>([]);


    const getStatusColor = (status: string) => {
        switch (status) {
        case 'scheduled': return 'bg-blue-500 text-blue-700';
        case 'ongoing': return 'bg-green-500 text-green-700';
        case 'completed': return 'bg-gray-500 text-gray-700';
        case 'cancelled': return 'bg-red-500 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
        }
    };


    const navigate = useNavigate();



    

    const fetchData = async(token: string) => {

        try{

            const historicMeetingsResponse = await axios.get(`${import.meta.env.VITE_MEETINGS_API}/meetings/fetch-student-historic-meetings`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            const transactionsResponse = await axios.get(`${import.meta.env.VITE_MEETINGS_API}/payments/fetch-transactions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
            setTransactions(transactionsResponse.data.data);
            console.log(transactionsResponse.data.data)
            setHistoricMeetings(historicMeetingsResponse.data.meetings);

        }catch(error){
            if(axios.isAxiosError(error)){
                alert(`ERROR WHILE FETCHING DATA: ${error.message}`)
            }else{
                alert(`UNKNOWN ERROR: ${error}`);
            };
        };
    };



    useEffect(() => {
        const value = sessionStorage.getItem("B2P-STUDENT-ACCESS-TOKEN");
        const token = value ? JSON.parse(value) : null;
        const date = Date.now();
        if (!token || date > token.expiry) {
        navigate("/");
        } else {
        console.log(token);
        fetchData(token.token);
        }
    }, []);



  return (
    <div className="min-h-screen background-image py-[2rem]">
        <Navbar />
        <div className="grid lg:grid-cols-3 gap-8 px-[2rem]">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                {/* Recent Assignments */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Upcoming Meetings</h2>
                    </div>
                    <div className="space-y-4">
                        {
                            historicMeetings.length !== 0 ?
                                <div className="">
                                    {
                                        historicMeetings.map((meeting, key) => (
                                            <div key={key} className="p-6 bg-gray-100 rounded-md mb-[1rem]">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900 capitalize">{meeting.title}</h3>
                                                            {/* <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                                                                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                                                            </span> */}
                                                        </div>

                                                        {meeting.description && (
                                                            <p className="text-sm text-gray-600 mb-3 capitalize">{meeting.description}</p>
                                                        )}

                                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Calendar className="w-4 h-4 text-blue-500" />
                                                                <span>Date: {meeting.date}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Clock className="w-4 h-4 text-green-500" />
                                                                <span>{meeting.duration} minutes</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Users className="w-4 h-4 text-orange-500" />
                                                                <span>{meeting.studentIds? meeting.studentIds.length : null} students</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Timer className="w-4 h-4 text-orange-500" />
                                                                <span>{meeting.studentIds? meeting.time : null}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className={`w-full mt-3 py-2 ${getStatusColor(meeting.status)} text-white rounded-lg capitalize cursor-pointer`}>
                                                    {meeting.status}
                                                </button>
                                                {
                                                    meeting.share_url?
                                                        <a href={meeting.share_url} target="_blank" className="">
                                                            <button className={`w-full mt-3 py-2 bg-green-500 text-white rounded-lg capitalize cursor-pointer`}>
                                                                watch recording
                                                            </button>
                                                        </a>
                                                    :
                                                    <></>

                                                }
                                                {
                                                    meeting.status == "ongoing"?
                                                    <a href={meeting.meetingLink} target="_blank" className="">
                                                        <button className={`w-full mt-3 py-2 bg-blue-500 text-white rounded-lg capitalize cursor-pointer`}>
                                                            Join Meeting
                                                        </button>
                                                    </a>
                                                        :
                                                        <></>

                                                }
                                            </div>
                                        ))
                                    }
                                </div>
                                :
                                <div className="px-[1rem] py-[2rem]">
                                    <h1 className="text-center">No Meetings Found</h1>
                                </div>
                        }
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
                {/* Today's Schedule */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="space-y-2">
                        {transactions.map((transaction, key) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div>
                            <div className="text-md text-gray-900 mb-0.5">ID: {transaction.transaction_id}</div>
                            <div className="text-md text-gray-500">
                                {
                                    new Date(transaction?.date).toLocaleDateString()
                                }
                            </div>
                            </div>
                            <div className="flex items-center gap-1">
                            <span className="text-md font-medium text-green-600">₹ {transaction.amount}</span>
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            </div>
                        </div>
                        ))}
                    </div>
                    {/* <button className="w-full mt-3 text-blue-500 border-[1px] border-blue-500 py-[1rem] rounded-lg text-blue-500 cursor-pointer">
                        View All Transactions
                    </button> */}
                    <button onClick={() => navigate('/payments')} className="w-full mt-3 text-md bg-blue-500 py-[1rem] rounded-lg text-white cursor-pointer">
                        Make Payment
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}