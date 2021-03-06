import React, {createRef} from "react";
import AppContext from "../../Decorators/AppContext";
import SubscriptionComponent from "../SubscriptionComponent";
import config from "../../config";
import Message from "./Message";

@AppContext
export default class Chat extends SubscriptionComponent {
    messages = createRef();

    state = {
        messages: [],
        message: '',
        scrollToBottom: true
    };

    componentDidMount() {
        this.openEvents({
            'chat.message': this.chatMessage,
        });
        this.openSubscriptions({
            'chat.message': this.chatMessage,
        });
    }

    chatMessage = message => {
        return this.appendMessage(message);
    };

    appendMessage = async message => {
        const {messages} = this.state;
        messages.push(message);

        if (messages.length > config.maxLobbyMessages) {
            messages.splice(messages.length - 1 - config.maxLobbyMessages, messages.length - config.maxLobbyMessages);
        }

        await this.setState({messages});
        this.scrollToBottom();
    };

    handleSubmit = async event => {
        event.preventDefault();

        const message = this.state.message.trim();

        if (message.length === 0) {
            return;
        }

        this.props.context.wss.send('chat.message', message);

        return this.setState({message: ''});
    };

    handleChange = event => {
        return this.setState({message: event.target.value});
    };

    scrollToBottom() {
        if (this.state.scrollToBottom) {
            this.messages.current.scrollTop = this.messages.current.scrollHeight - this.messages.current.clientHeight;
        }
    }

    handleScroll = event => {
        const scrollToBottom = event.target.scrollTop === this.messages.current.scrollHeight - this.messages.current.clientHeight;
        this.setState({scrollToBottom});
    };

    render() {
        return (
            <div className="Chat">
                <div className="Chat__messages" ref={this.messages} onScroll={this.handleScroll}>
                    {this.state.messages.map((message, index) => (
                        <Message key={index} message={message}/>
                    ))}
                </div>

                <div className="Chat__input">
                    <form onSubmit={this.handleSubmit} autoComplete="off">
                        <input
                            name="message"
                            placeholder="Enter your message..."
                            onChange={this.handleChange}
                            value={this.state.message}
                            autoFocus
                        />
                    </form>
                </div>
            </div>
        );
    }
}
