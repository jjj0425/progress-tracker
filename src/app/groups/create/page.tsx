// app/groups/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<{ name: string; required: boolean }[]>([]);
  const router = useRouter();

  const addField = () => {
    setFields([...fields, { name: "", required: false }]);
  };

  const updateField = (index: number, updatedField: { name: string; required: boolean }) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
  };

  const deleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 提交群組資料給後端
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName, description, fields }),
      });

      if (response.ok) {
        // 成功後導向群組列表頁面
        router.push("/groups");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div>
      <h1>Create New Group</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Group Name:
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <h2>Fields</h2>
        {fields.map((field, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Field Name"
              value={field.name}
              onChange={(e) =>
                updateField(index, { ...field, name: e.target.value })
              }
              required
            />
            <label>
              Required:
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) =>
                  updateField(index, { ...field, required: e.target.checked })
                }
              />
            </label>
            <button type="button" onClick={() => deleteField(index)}>
              Delete Field
            </button>
          </div>
        ))}
        <button type="button" onClick={addField}>
          Add Field
        </button>
        <button type="submit">Create Group</button>
      </form>
    </div>
  );
}