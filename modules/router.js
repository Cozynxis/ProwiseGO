import {renderPage as renderBasePage} from './pages.js';
import {renderTeacherExtra} from './teacher-extra.js';
import {renderStudentPage} from './student.js';

export function renderPage(state){
  if(state.portalMode==='student') return renderStudentPage(state);
  return renderTeacherExtra(state) || renderBasePage(state);
}
