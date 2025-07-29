import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MarkdownTextProps {
  children: string;
  style?: any;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ children, style }) => {
  const parseMarkdown = (text: string) => {
    const elements: React.ReactNode[] = [];
    const lines = text.split('\n');
    
    lines.forEach((line, lineIndex) => {
      if (!line.trim()) {
        elements.push(<Text key={`empty-${lineIndex}`} style={style}>{'\n'}</Text>);
        return;
      }
      
      // Handle headers
      if (line.startsWith('### ')) {
        elements.push(
          <Text key={lineIndex} style={[style, styles.h3]}>
            {line.substring(4).trim()}
          </Text>
        );
        return;
      }
      
      if (line.startsWith('## ')) {
        elements.push(
          <Text key={lineIndex} style={[style, styles.h2]}>
            {line.substring(3).trim()}
          </Text>
        );
        return;
      }
      
      if (line.startsWith('# ')) {
        elements.push(
          <Text key={lineIndex} style={[style, styles.h1]}>
            {line.substring(2).trim()}
          </Text>
        );
        return;
      }
      
      // Handle list items
      if (line.startsWith('- ') || line.startsWith('• ')) {
        elements.push(
          <View key={lineIndex} style={styles.listItem}>
            <Text style={[style, styles.bullet]}>•</Text>
            <Text style={[style, styles.listText]}>
              {parseInlineMarkdown(line.substring(2).trim(), style)}
            </Text>
          </View>
        );
        return;
      }
      
      // Handle regular paragraphs with inline formatting
      elements.push(
        <Text key={lineIndex} style={style}>
          {parseInlineMarkdown(line, style)}
          {lineIndex < lines.length - 1 ? '\n' : ''}
        </Text>
      );
    });
    
    return elements;
  };
  
  const parseInlineMarkdown = (text: string, baseStyle: any) => {
    // Simple approach: process bold first, then italic on remaining text
    const parts: (string | React.ReactNode)[] = [];
    
    // First pass: handle bold text (**text** or __text__)
    const boldRegex = /(\*\*([^*]+)\*\*|__([^_]+)__)/g;
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        parts.push(...processItalic(beforeText, baseStyle));
      }
      
      // Add the bold text
      const boldContent = match[2] || match[3];
      parts.push(
        <Text key={`bold-${match.index}`} style={[baseStyle, styles.bold]}>
          {boldContent}
        </Text>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      parts.push(...processItalic(remainingText, baseStyle));
    }
    
    return parts;
  };
  
  const processItalic = (text: string, baseStyle: any) => {
    const parts: (string | React.ReactNode)[] = [];
    
    // Handle italic text (*text* or _text_) - only single characters
    const italicRegex = /(\*([^*]+)\*|_([^_]+)_)/g;
    let lastIndex = 0;
    let match;
    
    while ((match = italicRegex.exec(text)) !== null) {
      // Skip if this looks like part of a bold pattern
      if (match[0].startsWith('**') || match[0].startsWith('__') || 
          match[0].endsWith('**') || match[0].endsWith('__')) {
        continue;
      }
      
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the italic text
      const italicContent = match[2] || match[3];
      parts.push(
        <Text key={`italic-${match.index}`} style={[baseStyle, styles.italic]}>
          {italicContent}
        </Text>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  return <View style={styles.container}>{parseMarkdown(children)}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  boldItalic: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  h1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
    width: '100%',
  },
  h2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 6,
    width: '100%',
  },
  h3: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginVertical: 2,
  },
  bullet: {
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
  },
});
