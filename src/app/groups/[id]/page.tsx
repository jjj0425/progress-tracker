"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Group, GroupField, GroupData } from "@prisma/client";

interface GroupDetails extends Group {
    fields: GroupField[];
    data: GroupData[];
}

export default function GroupDetailPage() {
    const router = useRouter();
    const params = useParams(); // 動態路由參數
    const groupId = params.id; // 提取 `id`
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false); // 控制新增資料表單
    const [newData, setNewData] = useState<Record<string, string>>({}); // 新增資料

    const userId = "CURRENT_USER_ID"; // 取得當前用戶 ID（從 session）

    useEffect(() => {
        if (!groupId) {
            console.log("No group ID provided.");
            router.push("/groups");
            return;
        }

        async function fetchGroupDetails() {
            try {
                const res = await fetch(`/api/groups/${groupId}`);
                if (res.ok) {
                    const data: GroupDetails = await res.json();
                    setGroup(data);
                } else {
                    console.error("Failed to fetch group details.");
                }
            } catch (error) {
                console.error("Error fetching group details:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchGroupDetails();
    }, [groupId, router]);

    const handleAddData = async () => {
        try {
            const res = await fetch(`/api/groups/${groupId}/data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newData),
            });

            if (res.ok) {
                const updatedGroup = await res.json();
                setGroup(updatedGroup); // 更新群組資料
                setShowAddForm(false); // 關閉表單
                setNewData({});
            } else {
                console.error("Failed to add data.");
            }
        } catch (error) {
            console.error("Error adding data:", error);
        }
    };

    const handleDeleteData = async (dataId: number) => {
        try {
            const res = await fetch(`/api/groups/${groupId}/data/${dataId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                const updatedGroup = await res.json();
                setGroup(updatedGroup); // 更新群組資料
            } else {
                console.error("Failed to delete data.");
            }
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    if (loading) {
        return <p>Loading group details...</p>;
    }

    if (!group) {
        return <p>Group not found.</p>;
    }

    return (
        <div>
            <h1>{group.name}</h1>
            <p>{group.description}</p>

            <h2>Data</h2>
            <table>
                <thead>
                    <tr>
                        {group.fields.map((field) => (
                            <th key={field.id}>{field.name}</th>
                        ))}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {group.data.map((data) => (
                        <tr key={data.id}>
                            {group.fields.map((field) => (
                                <td key={field.id}>
                                    {(data.fieldData as Record<string, string>)[field.name] || ""}
                                </td>
                            ))}
                            <td>
                                {(data.createdById === userId) && (
                                    <button onClick={() => handleDeleteData(data.id)}>
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button onClick={() => setShowAddForm(true)}>Add Data</button>

            {showAddForm && (
                <div>
                    <h3>Add New Data</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAddData();
                        }}
                    >
                        {group.fields.map((field) => (
                            <div key={field.id}>
                                <label>
                                    {field.name} {field.required && "*"}:
                                    <input
                                        type="text"
                                        value={newData[field.name] || ""}
                                        onChange={(e) =>
                                            setNewData({ ...newData, [field.name]: e.target.value })
                                        }
                                        required={field.required}
                                    />
                                </label>
                            </div>
                        ))}
                        <button type="submit">Submit</button>
                        <button onClick={() => setShowAddForm(false)}>Cancel</button>
                    </form>
                </div>
            )}

            <button onClick={() => router.push("/groups")}>Back to Groups</button>
        </div>
    );
}
