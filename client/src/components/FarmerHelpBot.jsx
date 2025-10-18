import React, { useState } from "react";
import { Container, Card, InputGroup, FormControl, Button } from "react-bootstrap";
import { FaUserAlt } from "react-icons/fa";

function FarmerHelpBot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I assist you with your farm today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "user", text: input }];
    setMessages(newMessages);

    // Simulate bot reply
    const reply = generateReply(input);
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    }, 600);

    setInput("");
  };

  const generateReply = (userText) => {
    userText = userText.toLowerCase();

    if (userText.includes("pesticide")) return "For pests, try neem-based pesticides.";
    if (userText.includes("irrigation")) return "Make sure you're irrigating based on soil moisture.";
    if (userText.includes("growth")) return "Ensure proper fertilization during vegetative stages.";
    return "Thanks for your question! I’ll try to assist you better soon.";
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card style={{ maxWidth: 370, width: "100%" }} className="shadow-lg">
        <Card.Body>
          <Card.Title className="text-success text-center mb-3">Farmer Help Bot</Card.Title>
          <div className="chat-box mb-3" style={{ minHeight: 240, maxHeight: 340, overflowY: "auto", background: "#f8f9fa", borderRadius: 8, padding: 10 }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 p-2 rounded ${msg.from === "bot" ? "bg-success text-white" : "bg-light text-dark"} align-self-${msg.from === "bot" ? "start" : "end"}`}
                style={{ maxWidth: "80%", wordBreak: "break-word" }}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <InputGroup className="mb-2">
            <FormControl
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your crops..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button variant="success" onClick={handleSend}>
              Send
            </Button>
          </InputGroup>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default FarmerHelpBot;
