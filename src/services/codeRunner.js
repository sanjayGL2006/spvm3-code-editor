/**
 * Code Execution Engine & Diagnostic Error Parser for SPVM3
 * Captures stdout, stderr, execution duration, line/col errors, and generates structural explanations.
 */

export async function runCode({ language, filePath, code }) {
  if (!window.spvm3) {
    return {
      success: false,
      stdout: '',
      stderr: 'SPVM3 Desktop bridge not detected (browser preview mode).',
      executionTimeMs: 0,
      exitCode: 1,
      parsedDiagnostics: null
    };
  }

  const result = await window.spvm3.runCode({ language, filePath, code });
  const parsedDiagnostics = parseDiagnostics(language, result.stderr, code);

  return {
    ...result,
    parsedDiagnostics
  };
}

export function parseDiagnostics(language, stderr, code) {
  if (!stderr || stderr.trim().length === 0) return null;

  let file = null;
  let line = null;
  let column = null;
  let category = 'Runtime Error';
  let message = stderr;
  let explanation = '';
  let fixSuggestion = '';

  if (language === 'python') {
    // e.g., File "main.py", line 12, in <module>
    const match = stderr.match(/File "([^"]+)", line (\d+)(?:, in (\w+))?/);
    if (match) {
      file = match[1];
      line = parseInt(match[2], 10);
    }
    if (stderr.includes('NameError:')) {
      category = 'NameError';
      const nameMatch = stderr.match(/name '(\w+)' is not defined/);
      const varName = nameMatch ? nameMatch[1] : 'variable';
      explanation = `The variable '${varName}' is referenced before it was assigned or defined in scope.`;
      fixSuggestion = `Define '${varName}' before accessing it (e.g. ${varName} = 0 or ${varName} = "")`;
    } else if (stderr.includes('SyntaxError:')) {
      category = 'SyntaxError';
      explanation = 'Python syntax rule was violated (check for missing colons, invalid indentation, or unmatched quotes/parentheses).';
      fixSuggestion = 'Check line punctuation, colons at function/loop headers, and matching brackets.';
    } else if (stderr.includes('IndentationError:')) {
      category = 'IndentationError';
      explanation = 'Unexpected or inconsistent indentation level.';
      fixSuggestion = 'Ensure consistent use of 4 spaces for Python indentation.';
    } else if (stderr.includes('TypeError:')) {
      category = 'TypeError';
      explanation = 'An operation or function was applied to an object of inappropriate type.';
      fixSuggestion = 'Verify variable data types or convert explicitly (e.g. str(val) or int(val)).';
    } else if (stderr.includes('IndexError:')) {
      category = 'IndexError';
      explanation = 'Sequence index out of range.';
      fixSuggestion = 'Check array/list length before indexing using len(items).';
    }
  } else if (language === 'javascript') {
    // e.g., ReferenceError: x is not defined at main.js:12:5
    const match = stderr.match(/(?:at\s+.*?\()?([^\s:]+):(\d+):(\d+)\)?/);
    if (match) {
      file = match[1];
      line = parseInt(match[2], 10);
      column = parseInt(match[3], 10);
    }
    if (stderr.includes('ReferenceError')) {
      category = 'ReferenceError';
      explanation = 'A variable or symbol that does not exist was referenced.';
      fixSuggestion = 'Declare the variable using let, const, or check for spelling mistakes.';
    } else if (stderr.includes('TypeError')) {
      category = 'TypeError';
      explanation = 'Calling a non-function or reading property of undefined/null.';
      fixSuggestion = 'Use optional chaining (object?.property) or check for non-null state before access.';
    } else if (stderr.includes('SyntaxError')) {
      category = 'SyntaxError';
      explanation = 'JavaScript parser encountered invalid code structure.';
      fixSuggestion = 'Check for missing closing braces }, parentheses ), or trailing commas.';
    }
  } else if (language === 'c' || language === 'cpp') {
    // GCC format: main.c:12:5: error: 'x' undeclared
    const match = stderr.match(/([^\s:]+):(\d+):(\d+):\s+(error|warning):\s+(.*)/);
    if (match) {
      file = match[1];
      line = parseInt(match[2], 10);
      column = parseInt(match[3], 10);
      category = match[4] === 'error' ? 'Compilation Error' : 'Warning';
      message = match[5];
      explanation = `C/C++ Compiler reported: ${match[5]}`;
      fixSuggestion = 'Check header includes (#include <stdio.h>), variable declarations, and semicolon termination.';
    }
  } else if (language === 'java') {
    // Java format: Main.java:12: error: cannot find symbol
    const match = stderr.match(/([^\s:]+\.java):(\d+):\s+error:\s+(.*)/);
    if (match) {
      file = match[1];
      line = parseInt(match[2], 10);
      category = 'Java Compiler Error';
      message = match[3];
      explanation = `Java Compiler reported: ${match[3]}`;
      fixSuggestion = 'Check import statements, variable declarations, and public class file naming match.';
    }
  } else if (language === 'csharp') {
    // C# format: Program.cs(12,5): error CS0103: The name 'x' does not exist in the current context
    const match = stderr.match(/([^\s:(]+)\((\d+),(\d+)\):\s+error\s+(CS\d+):\s+(.*)/);
    if (match) {
      file = match[1];
      line = parseInt(match[2], 10);
      column = parseInt(match[3], 10);
      category = `C# Error (${match[4]})`;
      message = match[5];
      explanation = `C# Compiler reported: ${match[5]}`;
      fixSuggestion = 'Verify using directives (e.g. using System;), scope, and variable declarations.';
    }
  }

  return {
    file,
    line,
    column,
    category,
    message,
    explanation: explanation || 'An unexpected execution exception occurred.',
    fixSuggestion: fixSuggestion || 'Review code logic around the indicated file and line number.',
    fullStderr: stderr
  };
}
