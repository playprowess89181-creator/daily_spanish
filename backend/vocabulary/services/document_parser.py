from typing import List, Dict

def parse_text_lines(lines: List[str]) -> Dict[str, List[Dict]]:
    vocabulary = []
    exercises = []
    section = None
    current = {}
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.upper().startswith('VOCABULARY'):
            section = 'VOCABULARY'
            i += 1
            continue
        if line.upper().startswith('EXERCISES'):
            section = 'EXERCISES'
            i += 1
            continue
        if section == 'VOCABULARY':
            if line.upper().startswith('WORD:'):
                word = line.split(':', 1)[1].strip()
                img_line = ''
                j = i + 1
                while j < len(lines):
                    nxt = lines[j].strip()
                    if nxt.upper().startswith('IMAGE NAME:'):
                        img_line = nxt.split(':', 1)[1].strip()
                        break
                    if nxt.upper().startswith('WORD:') or nxt.upper().startswith('EXERCISES'):
                        break
                    j += 1
                vocabulary.append({'word': word, 'imageName': img_line})
            i += 1
            continue
        if section == 'EXERCISES':
            if line.upper().startswith('TYPE:'):
                current = {'type': line.split(':', 1)[1].strip(), 'question': '', 'options': [], 'answer': ''}
                i += 1
                continue
            if line.upper().startswith('QUESTION:') and current:
                current['question'] = line.split(':', 1)[1].strip()
                i += 1
                continue
            if line.upper().startswith('OPTIONS:') and current:
                opts = line.split(':', 1)[1].strip()
                current['options'] = [o.strip() for o in opts.split(',') if o.strip()]
                i += 1
                continue
            if line.upper().startswith('ANSWER:') and current:
                current['answer'] = line.split(':', 1)[1].strip()
                exercises.append(current)
                current = {}
                i += 1
                continue
            i += 1
            continue
        i += 1
    return {'vocabulary': vocabulary, 'exercises': exercises}

