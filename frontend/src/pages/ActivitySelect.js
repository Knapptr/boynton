import { Droppable, DragDropContext } from "@react-forked/dnd";
import { useParams } from "react-router-dom";
import Camper from "../components/Camper";
import useGetDataOnMount from "../hooks/useGetData";
const ActivitySelect = () => {
	const { cabinName, weekNumber, periodID } = useParams();
	return <h1>hello</h1>;
};

export default ActivitySelect;
