import sys
import os
import io
import contextlib
import signal

# Configuration
EXECUTION_TIMEOUT = 3 # seconds
MAX_OUTPUT_LENGTH = 10000 # 10KB

def handler(signum, frame):
    raise TimeoutError("Time Limit Exceeded")

# Set timeout handler
signal.signal(signal.SIGALRM, handler)

def read_file(path):
    try:
        with open(path, 'r') as f:
            return f.read()
    except Exception as e:
        sys.stderr.write(f"Error reading solution file: {e}\n")
        sys.exit(1)

def execute_code(code, input_data):
    # Capture stdout/stderr
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    
    # Prepare execution environment
    # We restrict builtins slightly, but mostly rely on Docker for isolation
    safe_globals = {
        '__builtins__': __builtins__,
        'input': lambda: input_data_iter.__next__() if input_data_iter else "",
        'print': lambda *args, **kwargs: print(*args, file=stdout_capture, **kwargs)
    }
    
    # Handle input iteration
    input_lines = input_data.split('\n')
    input_data_iter = iter(input_lines)
    
    try:
        # Start timeout
        signal.alarm(EXECUTION_TIMEOUT)
        
        with contextlib.redirect_stdout(stdout_capture), contextlib.redirect_stderr(stderr_capture):
            exec(code, safe_globals)
            
        # Stop timeout
        signal.alarm(0)
        
        # Process output
        output = stdout_capture.getvalue()
        error = stderr_capture.getvalue()
        
        if len(output) > MAX_OUTPUT_LENGTH:
            output = output[:MAX_OUTPUT_LENGTH] + "\n...[Output Truncated]"
            
        sys.stdout.write(output)
        if error:
            sys.stderr.write(error)
            
        sys.exit(0)
        
    except TimeoutError:
        sys.stderr.write("Time Limit Exceeded\n")
        sys.exit(124)
    except Exception as e:
        sys.stderr.write(f"Runtime Error: {e}\n")
        sys.exit(1)
        
if __name__ == "__main__":
    # Read user code
    user_code = read_file('/app/temp/solution.py')
    
    # Read test input from stdin
    test_input = sys.stdin.read()
    
    execute_code(user_code, test_input)
