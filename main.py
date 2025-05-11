#!/usr/bin/env python
"""
Main entry point for the Cooperative Semantic Communication backend.
This script allows users to run different components of the system.
"""

import os
import sys
import argparse
from typing import List, Optional
import importlib.util


def display_banner():
    """Display a welcome banner for the application."""
    print(r"""
    ======================================================
     Cooperative Semantic Communication Backend
     Mini Project - 6th Semester
    ======================================================
    """)


def run_semantic_server():
    """Run the semantic similarity server"""
    print("Starting the Semantic Similarity Server...")
    import semantic_server
    semantic_server.run_server()


def run_awgn_simulation(args: List[str]):
    """Run the AWGN simulation"""
    print("Starting AWGN Simulation...")
    import awgn_simulation
    
    # Run interactive simulation that will prompt for parameters
    awgn_simulation.run_interactive_simulation()


def run_semantic_flow():
    """Run the semantic communication flow"""
    try:
        # Use our simplified demo script for clearer output
        import subprocess
        subprocess.call([sys.executable, 'simple_demo.py'])
    except Exception as e:
        print(f"Error running semantic flow: {e}")
        print("Running backup implementation...")
        
        print("\n" + "=" * 70)
        print(" SEMANTIC COMMUNICATION FLOW ".center(70, "="))
        print("=" * 70)
        
        # Import flow module
        import semantic_flow
        
        # Get user input
        print("\nEnter a sentence to process through the semantic pipeline:")
        input_text = input("> ")
        
        if not input_text:
            print("No input provided. Using default text.")
            input_text = "This is a test message for semantic communication"
        
        try:
            ebno_db = float(input("Enter Eb/N0 in dB (or press Enter for default 5.0): ") or 5.0)
        except ValueError:
            print("Invalid input. Using default value.")
            ebno_db = 5.0
        
        # Create flow processor
        flow = semantic_flow.SemanticFlow()
        
        # Run the flow with the user's text
        print(f"\nProcessing: \"{input_text}\" with Eb/N0 = {ebno_db} dB\n")
        result = flow.run_flow(input_text, ebno_db)
        
        # Display summary results at the end
        print("\n" + "=" * 50)
        print(" RESULTS SUMMARY ".center(50, "="))
        print("=" * 50)
        print(f"Input text:        \"{result['input_text']}\"")
        print(f"LLM processed:     \"{result['llm_processed']}\"")
        print(f"BPSK noisy text:   \"{result['noisy_text']}\"")
        print(f"Reconstructed:     \"{result['reconstructed_text']}\"")
        print(f"Similarity score:   {result['similarity']:.5f}")
        print("=" * 50)


def main(argv: Optional[List[str]] = None):
    """Main entry point for the application."""
    parser = argparse.ArgumentParser(
        description="Cooperative Semantic Communication Backend"
    )
    
    # Add subparsers for different commands
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Semantic server command
    semantic_parser = subparsers.add_parser("server", help="Run the semantic similarity server")
    
    # AWGN simulation command
    awgn_parser = subparsers.add_parser("awgn", help="Run AWGN simulation")
    
    # Semantic flow command
    flow_parser = subparsers.add_parser("flow", help="Run the semantic communication flow")
    
    # Parse arguments
    args = parser.parse_args(argv)
    
    # Display welcome banner
    display_banner()
    
    # Execute the requested command
    if args.command == "server":
        run_semantic_server()
    elif args.command == "awgn":
        run_awgn_simulation([])
    elif args.command == "flow":
        run_semantic_flow()
    else:
        # If no command is provided, show interactive menu
        while True:
            print("\nAvailable Commands:")
            print("1. Run Semantic Similarity Server")
            print("2. Run AWGN Simulation")
            print("3. Run Semantic Communication Flow")
            print("0. Exit")
            
            choice = input("\nEnter your choice (0-3): ")
            
            if choice == "1":
                run_semantic_server()
                break  # Break after running server as it's a long-running process
            elif choice == "2":
                run_awgn_simulation([])
                input("\nPress Enter to continue...")
            elif choice == "3":
                run_semantic_flow()
                input("\nPress Enter to continue...")
            elif choice == "0":
                print("Exiting...")
                break
            else:
                print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()