import "../css/ReactionPicker.css";

const reactions = [
    "❤️",
    "👍",
    "😂",
    "😮",
    "😢",
    "😡"
];

const ReactionPicker = ({
    onReact,
    onClose
}) => {
    return (
        <div
            className="reaction-picker"
            onClick={(event) =>
                event.stopPropagation()
            }
        >

            {reactions.map((emoji) => (

                <button
                    key={emoji}
                    type="button"
                    className="reaction-option"
                    onClick={() => {

                        if (onReact) {
                            onReact(emoji);
                        }

                        if (onClose) {
                            onClose();
                        }

                    }}
                >
                    {emoji}
                </button>

            ))}

        </div>
    );
};

export default ReactionPicker;