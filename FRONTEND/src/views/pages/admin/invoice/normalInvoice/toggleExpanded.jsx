const [expandedId, setExpandedId] = useState(null);

const toggleExpanded = (id) => {
	setExpandedId(expandedId === id ? null : id);
};
