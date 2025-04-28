#!/usr/bin/env python
"""
Main entry point for the Cooperative Semantic Communication backend.
This script allows users to run different components of the system.
"""

import os
import sys
import argparse
from typing import List, Optional


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
    
    # Parse arguments
    args = parser.parse_args(argv)
    
    # Display welcome banner
    display_banner()
    
    # Execute the requested command
    if args.command == "server":
        run_semantic_server()
    elif args.command == "awgn":
        run_awgn_simulation([])
    else:
        # If no command is provided, show interactive menu
        while True:
            print("\nAvailable Commands:")
            print("1. Run Semantic Similarity Server")
            print("2. Run AWGN Simulation")
            print("0. Exit")
            
            choice = input("\nEnter your choice (0-2): ")
            
            if choice == "1":
                run_semantic_server()
                break  # Break after running server as it's a long-running process
            elif choice == "2":
                run_awgn_simulation([])
                input("\nPress Enter to continue...")
            elif choice == "0":
                print("Exiting...")
                break
            else:
                print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()