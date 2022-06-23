import tw from 'twin.macro';
import 'styled-components/macro';
import {MenuSelector} from './styled';

const ActivitySelectors = ({selectAll,selectSpecific,period,displayAll,selected})=>{
  const isSelected = (activity) =>{
    if(selected === null){return false};
    const selectedAct = period.activities[selected]
    return selectedAct.id === activity.id;
  }
  return (
              <ul tw="flex justify-center gap-2 flex-wrap">
                <MenuSelector onClick={selectAll} isSelected={displayAll}>
                  <button>All</button>
                </MenuSelector>
                {period.activities.map((act, index) => (
                  <MenuSelector
                    onClick={() => {
                      selectSpecific(index);
                    }}
                    isSelected={isSelected(act)}
                    key={`act-select-${index}`}
                  >
                    <button>{act.name}</button>
                  </MenuSelector>
                ))}
              </ul>
  )
}

export default ActivitySelectors;
